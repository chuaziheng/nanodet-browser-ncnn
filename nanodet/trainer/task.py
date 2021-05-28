# Copyright 2021 RangiLyu.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import time
import copy
import os
import warnings
import torch
from pytorch_lightning import LightningModule
from typing import Any, List, Dict, Tuple, Optional

from ..model.arch import build_model
from nanodet.util import mkdir, load_model_weight, save_model, MovingAverage, AverageMeter


class TrainingTask(LightningModule):
    """
    Pytorch Lightning module of a general training task.
    """

    def __init__(self, cfg, evaluator=None, logger=None):
        """

        Args:
            cfg: Training configurations
            evaluator:
            logger:
        """
        super(TrainingTask, self).__init__()
        self.cfg = cfg
        self.model = build_model(cfg.model)
        self.evaluator = evaluator
        self._logger = logger
        self.save_flag = -10
        # TODO: load model
        # TODO: resume training
        # TODO: better logger
        # TODO: batch eval

    def forward(self, x):
        x = self.model(x)
        return x

    @torch.no_grad()
    def predict(self, batch, batch_idx, dataloader_idx):
        preds = self.forward(batch['img'])
        results = self.model.head.post_process(preds, batch)
        return results

    def training_step(self, batch, batch_idx):
        preds, loss, loss_states = self.model.forward_train(batch)
        for k, v in loss_states.items():
            self.log('Train/'+k, v, on_step=True, on_epoch=True, prog_bar=True, sync_dist=True)
        return loss

    def training_epoch_end(self, outputs: List[Any]) -> None:
        self.lr_scheduler.step()

    def validation_step(self, batch, batch_idx):
        preds, loss, loss_states = self.model.forward_train(batch)
        for k, v in loss_states.items():
            self.log('Val/' + k, v, on_step=True, on_epoch=True, prog_bar=True, sync_dist=True)
        dets = self.model.head.post_process(preds, batch)
        res = {batch['img_info']['id'].cpu().numpy()[0]: dets}
        return res

    def validation_epoch_end(self, validation_step_outputs):
        results = {}
        for res in validation_step_outputs:
            results.update(res)

        eval_results = self.evaluator.evaluate(results, self.cfg.save_dir, self.current_epoch,
                                               self._logger, rank=self.local_rank)
        metric = eval_results[self.cfg.evaluator.save_key]

        # ------save best model--------
        if metric > self.save_flag:
            self.save_flag = metric
            best_save_path = os.path.join(self.cfg.save_dir, 'model_best')
            mkdir(self.local_rank, best_save_path)
            # TODO: replace with saving checkpoint
            save_model(self.local_rank, self.model, os.path.join(best_save_path, 'model_best.pth'),
                       self.current_epoch+1, self.global_step)
            txt_path = os.path.join(best_save_path, "eval_results.txt")
            if self.local_rank < 1:
                with open(txt_path, "a") as f:
                    f.write("Epoch:{}\n".format(self.current_epoch+1))
                    for k, v in eval_results.items():
                        f.write("{}: {}\n".format(k, v))
        else:
            warnings.warn('Warning! Save_key is not in eval results! Only save model last!')
        # TODO: log val metrics
        # for k, v in eval_results.items():
        #     self.log('Val/' + k, v, on_step=False, on_epoch=True, prog_bar=True, sync_dist=True)

    def configure_optimizers(self):
        optimizer_cfg = copy.deepcopy(self.cfg.schedule.optimizer)
        name = optimizer_cfg.pop('name')
        build_optimizer = getattr(torch.optim, name)
        optimizer = build_optimizer(params=self.parameters(), **optimizer_cfg)

        schedule_cfg = copy.deepcopy(self.cfg.schedule.lr_schedule)
        name = schedule_cfg.pop('name')
        build_scheduler = getattr(torch.optim.lr_scheduler, name)
        self.lr_scheduler = build_scheduler(optimizer=optimizer, **schedule_cfg)
        # lr_scheduler = {'scheduler': self.lr_scheduler,
        #                 'interval': 'epoch',
        #                 'frequency': 1}
        # return [optimizer], [lr_scheduler]

        return optimizer

    def optimizer_step(self,
                       epoch=None,
                       batch_idx=None,
                       optimizer=None,
                       optimizer_idx=None,
                       optimizer_closure=None,
                       on_tpu=None,
                       using_native_amp=None,
                       using_lbfgs=None):
        # warm up lr
        if self.trainer.global_step <= self.cfg.schedule.warmup.steps:
            if self.cfg.schedule.warmup.name == 'constant':
                warmup_lr = self.cfg.schedule.optimizer.lr * self.cfg.schedule.warmup.ratio
            elif self.cfg.schedule.warmup.name == 'linear':
                k = (1 - self.trainer.global_step / self.cfg.schedule.warmup.steps) * (1 - self.cfg.schedule.warmup.ratio)
                warmup_lr = self.cfg.schedule.optimizer.lr * (1 - k)
            elif self.cfg.schedule.warmup.name == 'exp':
                k = self.cfg.schedule.warmup.ratio ** (1 - self.trainer.global_step / self.cfg.schedule.warmup.steps)
                warmup_lr = self.cfg.schedule.optimizer.lr * k
            else:
                raise Exception('Unsupported warm up type!')
            for pg in optimizer.param_groups:
                pg['lr'] = warmup_lr
        # TODO: log lr to tensorboard
        # self.log('lr', optimizer.param_groups[0]['lr'], on_step=True, on_epoch=True, prog_bar=True)

        # update params
        optimizer.step(closure=optimizer_closure)
        optimizer.zero_grad()

    def get_progress_bar_dict(self):

        # don't show the version number
        items = super().get_progress_bar_dict()
        items.pop("v_num", None)
        return items







