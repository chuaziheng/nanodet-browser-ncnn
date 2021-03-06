import torch
from .rank_filter import rank_filter

def load_model_weight(model, checkpoint, logger):
    state_dict = checkpoint['state_dict']
    # strip prefix of state_dict
    if list(state_dict.keys())[0].startswith('module.'):
        state_dict = {k[7:]: v for k, v in checkpoint['state_dict'].items()}

    model_state_dict = model.module.state_dict() if hasattr(model, 'module') else model.state_dict()
    # print(f"model_state_dict {model_state_dict.keys()}")  # backbone.conv1.0.weight"
    # print(f"state_dict {state_dict.keys()}") # model.backbone.conv1.0.weight

    # check loaded parameters and created model parameters
    for k in state_dict:
        if k in model_state_dict:
            # print(k)
            if state_dict[k].shape != model_state_dict[k].shape:
                logger.log('Skip loading parameter {}, required shape{}, loaded shape{}.'.format(
                    k, model_state_dict[k].shape, state_dict[k].shape))
                # model_state_dict: (32+num_class, 96, 1, 1)   ---- this is the custom model shape
                state_dict[k] = model_state_dict[k]
                # state_dict: (112, 96, 1, 1)   ---- this is the pretrained model shape
        else:
            logger.log('Drop parameter {}.'.format(k))
    for k in model_state_dict:
        if not (k in state_dict):
            # logger.log('No param {}.'.format(k))
            state_dict[k] = model_state_dict[k]
    model.load_state_dict(state_dict, strict=False)


@rank_filter
def save_model(model, path, epoch, iter, optimizer=None):
    model_state_dict = model.module.state_dict() if hasattr(model, 'module') else model.state_dict()
    data = {'epoch': epoch,
            'state_dict': model_state_dict,
            'iter': iter}
    if optimizer is not None:
        data['optimizer'] = optimizer.state_dict()

    torch.save(data, path)
