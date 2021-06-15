import pycocotools.coco as coco
from pycocotools.cocoeval import COCOeval
import json
import os
import copy
import numpy as np

def xyxy2xywh(bbox):
    """
    change bbox to coco format
    :param bbox: [x1, y1, x2, y2]
    :return: [x, y, w, h]
    """
    return [
        bbox[0],
        bbox[1],
        bbox[2] - bbox[0],
        bbox[3] - bbox[1],
    ]


class CocoDetectionEvaluator:
    def __init__(self, dataset, class_names, score_thresh_test=0.05):
        assert hasattr(dataset, 'coco_api')
        self.coco_api = dataset.coco_api
        self.cat_ids = dataset.cat_ids
        self.class_names = class_names
        self.metric_names = ['mAP', 'AP_50', 'AP_75', 'AP_small', 'AP_m', 'AP_l']
        self.score_thresh_test =score_thresh_test

    def results2json(self, results):
        """
        results: {image_id: {label: [bboxes...] } }
        :return coco json format: {image_id:
                                   category_id:
                                   bbox:
                                   score: }
        """
        json_results = []
        for image_id, dets in results.items():
            for label, bboxes in dets.items():
                category_id = self.cat_ids[label]
                for bbox in bboxes:
                    score = float(bbox[4])
                    if score<self.score_thresh_test:
                        continue
                    detection = dict(
                        image_id=image_id, #=int(image_id),
                        category_id=int(category_id),
                        bbox=xyxy2xywh(bbox),
                        score=score)
                    json_results.append(detection)
        return json_results

    def evaluate(self, results, save_dir, epoch, logger, rank=-1):
        results_json = self.results2json(results)
        json_path = os.path.join(save_dir, 'results{}.json'.format(rank))
        json.dump(results_json, open(json_path, 'w'))
        print(f"json path {json_path}")
        coco_dets = self.coco_api.loadRes(json_path)
        coco_eval = COCOeval(copy.deepcopy(self.coco_api), copy.deepcopy(coco_dets), "bbox")
        coco_eval.evaluate()
        coco_eval.accumulate()
        coco_eval.summarize()
        aps = coco_eval.stats[:6]
        precisions = coco_eval.eval["precision"]

        # precision has dims (10 different iou thresholds, recall thresholds??, num_classes, area range, max detections??)
        assert len(self.class_names) == precisions.shape[2]

        # Print AP per class
        results_per_category = []
        for idx, name in enumerate(self.class_names):
            # for area range, choose index 0: all area ranges
            # for max detections, choose index -1: typically 100 per image
            # precision = precisions[:, :, idx, 0, -1]
            precision = precisions[0, :, idx, 0, -1] # only AP50 (not AP) per class!!
            precision = precision[precision > -1]
            ap = np.mean(precision) if precision.size else float("nan")
            results_per_category.append(("{}".format(name), float(ap)))
            logger.writer.add_scalar('Val_coco_bbox/AP_50_' + name,ap, epoch)
        results = {"Val_coco_bbox/AP_50_" + name: ap for name, ap in results_per_category}
        eval_results = {}
        for k, v in zip(self.metric_names, aps):
            eval_results[k] = v
            # logger.scalar_summary('Val_coco_bbox/' + k, 'val', v, epoch)
            logger.writer.add_scalar('Val_coco_bbox/' + k,v, epoch)
        eval_results.update(results)
        return eval_results
