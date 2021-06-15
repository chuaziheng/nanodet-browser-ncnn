import os
import logging
import shutil
from openimages.download import download_dataset
import argparse

########################### Hardcode images per class #####################################
IMG_PER_CLASS = 400  # ideal amount, any more training data proved to be of negligible improvement
##########################################################################################
NUM_TRAIN = int(0.7 * IMG_PER_CLASS)  # 7/2/1 split
NUM_VAL =  int(0.9* IMG_PER_CLASS)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--simple',action='store_true', help='simple download without train test split')
    args = parser.parse_args()
    return args

def split_train_test(data_path):
    class_list = os.listdir(data_path) # list of classes

    print("creating destination directories...")
    dest_path = os.getcwd() + '/nanodet/data/dataset/coco'
    # TODO: direct to coco folder
    dest_train = dest_path + '/train'
    if os.path.isdir(dest_train):
        shutil.rmtree(dest_train)
        os.makedirs(dest_train)
    else:
        os.makedirs(dest_train)  # create new train dest dir

    dest_validate = dest_path + '/validate'
    if os.path.isdir(dest_validate):
        shutil.rmtree(dest_validate)
        os.makedirs(dest_validate)
    else:
        os.makedirs(dest_validate)  # create new train dest dir

    dest_test = dest_path + '/test'
    if os.path.isdir(dest_test):
        shutil.rmtree(dest_test)
        os.makedirs(dest_test)
    else:
        os.makedirs(dest_test)  # create new train dest dir

    for c in class_list:
        class_dir  = os.path.join(data_path, c)

        pascal_dir = os.path.join(class_dir, 'pascal')
        images_dir = os.path.join(class_dir, 'images')


        train, val , test = sorted(os.listdir(images_dir))[: NUM_TRAIN], sorted(os.listdir(images_dir))[NUM_TRAIN: NUM_VAL], sorted(os.listdir(images_dir))[NUM_VAL:]

        for img in train:
            source = os.path.join(images_dir, img)
            dest = os.path.join(dest_train, img)
            shutil.move(source, dest)
        for img in val:
            source = os.path.join(images_dir, img)
            dest = os.path.join(dest_validate, img)
            shutil.move(source, dest)
        for img in test:
            source = os.path.join(images_dir, img)
            dest = os.path.join(dest_test, img)
            shutil.move(source, dest)

        train, val , test = sorted(os.listdir(pascal_dir))[: NUM_TRAIN], sorted(os.listdir(pascal_dir))[NUM_TRAIN: NUM_VAL], sorted(os.listdir(pascal_dir))[NUM_VAL:]

        for xml in train:
            source = os.path.join(pascal_dir, xml)
            dest = os.path.join(dest_train, xml)
            shutil.move(source, dest)
        for xml in val:
            source = os.path.join(pascal_dir, xml)
            dest = os.path.join(dest_validate, xml)
            shutil.move(source, dest)
        for xml in test:
            source = os.path.join(pascal_dir, xml)
            dest = os.path.join(dest_test, xml)
            shutil.move(source, dest)


if __name__ == "__main__":
    #TODO: clear dataset folders
    args = parse_args()
    if args.simple:
        print("simple")
        data_path = os.getcwd() + '/nanodet/nanodet/data/dataset/simple_data'
        os.mkdir(data_path)
        ############################# Hardcode classes to be downloaded ################################################################
        download_dataset(data_path , ["Bottle","Computer mouse","Person", "Mobile phone"],  annotation_format="pascal", limit = IMG_PER_CLASS)
        ##################################################################################################################################
    else:
        data_path = os.getcwd() + '/nanodet/data/dataset/googleOI_dataset'
        if os.path.isdir(data_path):
            shutil.rmtree(data_path)
            os.makedirs(data_path)
        else:
            os.makedirs(data_path)  # create new train dest dir
        logging.info(data_path)
        print("downloading dataset...")
        ############################# Hardcode classes to be downloaded ################################################################
        download_dataset(data_path , ["Watch","Human hand", "Mobile phone"],  annotation_format="pascal", limit = IMG_PER_CLASS)
        ##################################################################################################################################
        split_train_test(data_path)




