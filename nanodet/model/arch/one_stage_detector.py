import time
import torch
import torch.nn as nn
from ..backbone import build_backbone
from ..fpn import build_fpn
from ..head import build_head

class OneStageDetector(nn.Module):
    def __init__(self,
                 backbone_cfg,
                 fpn_cfg=None,
                 head_cfg=None,):
        super(OneStageDetector, self).__init__()
        self.backbone = build_backbone(backbone_cfg)  # build ShuffleNetV2 backbone
        if fpn_cfg is not None:
            self.fpn = build_fpn(fpn_cfg)
        if head_cfg is not None:
            self.head = build_head(head_cfg)

    def forward(self, x):
        x = self.backbone(x)
        if hasattr(self, 'fpn'):
            x = self.fpn(x)
        if hasattr(self, 'head'):
            x = self.head(x)
        return x

    def inference(self, meta):
        with torch.no_grad():
            try:
                torch.cuda.synchronize()
            except AssertionError:
                pass # using CPU installation of torch
            time1 = time.time()
            try:
                preds = self(meta['img'].to(device=self.device, non_blocking = True))  # AttributeError:
            except AttributeError:
                preds = self(meta['img'])
            try:
                torch.cuda.synchronize()
            except AssertionError:
                pass # using CPU installation of torch
            time2 = time.time()
            print('forward time: {:.3f}s'.format((time2 - time1)), end=' | ')
            results = self.head.post_process(preds, meta)
            try:
                torch.cuda.synchronize()
            except AssertionError:
                pass # using CPU installation of torch
            print('decode time: {:.3f}s'.format((time.time() - time2)), end=' | ')
        return results

    def forward_train(self, gt_meta):
        preds = self(gt_meta['img'].to(device=self.device, non_blocking = True))# #TODO: Checking whether this is necessary
        loss, loss_states = self.head.loss(preds, gt_meta)

        return preds, loss, loss_states
