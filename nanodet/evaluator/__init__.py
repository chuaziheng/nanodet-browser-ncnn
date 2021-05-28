from .coco_detection import CocoDetectionEvaluator


def build_evaluator(cfg, dataset, score_thresh_test):
    if cfg.evaluator.name == 'CocoDetectionEvaluator':
        return CocoDetectionEvaluator(dataset,  cfg.class_names, score_thresh_test)
    else:
        raise NotImplementedError
