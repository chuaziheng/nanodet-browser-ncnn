// global vars
var imgURL = '';
var myimg = document.getElementById('img');
var timeout = 1000000;

var Module = {};

var has_simd;
var has_threads;

var wasmModuleLoaded = false;
var wasmModuleLoadedCallbacks = [];

Module.onRuntimeInitialized = function() {
    wasmModuleLoaded = true;
    for (var i = 0; i < wasmModuleLoadedCallbacks.length; i++) {
        wasmModuleLoadedCallbacks[i]();
    }
}

wasmFeatureDetect.simd().then(simdSupported => {
    has_simd = simdSupported;

    wasmFeatureDetect.threads().then(threadsSupported => {
        has_threads = threadsSupported;

        if (has_simd)
        {
            if (has_threads)
            {
                nanodet_module_name = 'nanodet-simd-threads';
            }
            else
            {
                nanodet_module_name = 'nanodet-simd';
            }
        }
        else
        {
            if (has_threads)
            {
                nanodet_module_name = 'nanodet-threads';
            }
            else
            {
                nanodet_module_name = 'nanodet-basic';
            }
        }

        console.log('load ' + nanodet_module_name);

        var nanodetwasm = './build/' + nanodet_module_name + '.wasm';
        var nanodetjs = './build/' + nanodet_module_name + '.js';

        fetch(nanodetwasm)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                Module.wasmBinary = buffer;
                var script = document.createElement('script');
                script.src = nanodetjs;
                script.onload = function() {
                    console.log('Emscripten boilerplate loaded.');
                }
                document.body.appendChild(script);
            });

    });
});

var shouldFaceUser = true;
var stream = null;
var w = 640;
var h = 480;

var dst = null;
var resultarray = null;
var resultbuffer = null;

var isStreaming = false;

// WEBCAM INFERENCING ################################################################################

window.addEventListener('DOMContentLoaded', function() {

    document.getElementById("webcamButton").addEventListener("click", function() {

        // Hide
        $('#myForm').addClass('d-none');
        $("#img").addClass('d-none');
        $("#predict").addClass('d-none');
        imgURL = '';
        // Display
        $("#video").removeClass('d-none');
        console.log("WEBCAM STATE");

        switchcamerabtn = document.getElementById('switch-camera-btn');
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        // Wait until the video stream canvas play
        video.addEventListener('canplay', function(e) {
            if (!isStreaming) {
                // videoWidth isn't always set correctly in all browsers
                if (video.videoWidth > 0) h = video.videoHeight / (video.videoWidth / w);
                canvas.setAttribute('width', w);
                canvas.setAttribute('height', h);
                isStreaming = true;
                }
            }, false);

        // Wait for the video to start to play
        video.addEventListener('play', function() {
            //Setup image memory
            var id = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var d = id.data;

            if (wasmModuleLoaded) {
                mallocAndCallSFilter();
            } else {
                wasmModuleLoadedCallbacks.push(mallocAndCallSFilter);
            }

            function mallocAndCallSFilter() {
                if (dst != null)
                {
                    _free(dst);
                    dst = null;
                }

                dst = _malloc(d.length);

                //console.log("What " + d.length);

                sFilter();
            }
        });

        // check whether we can use facingMode
        var supports = navigator.mediaDevices.getSupportedConstraints();
        if (supports['facingMode'] === true) {
            switchcamerabtn.disabled = false;
        }

        switchcamerabtn.addEventListener('click', function() {
            if (stream == null)
                return

            stream.getTracks().forEach(t => {
                t.stop();
            });

            shouldFaceUser = !shouldFaceUser;
            capture();
        });

        capture();


        function capture() {
            var constraints = { audio: false, video: { width: 640, height: 480, facingMode: shouldFaceUser ? 'user' : 'environment' } };
            navigator.mediaDevices.getUserMedia(constraints)
                .then(function(mediaStream) {
                    var video = document.querySelector('video');
                    stream = mediaStream;
                    video.srcObject = mediaStream;
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                })
                .catch(function(err) {
                    console.log(err.message);
                });
        }


        function ncnn_nanodet() {
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;

            HEAPU8.set(data, dst);

            _nanodet_ncnn(dst, canvas.width, canvas.height);

            var result = HEAPU8.subarray(dst, dst + data.length);
            imageData.data.set(result);
            ctx.putImageData(imageData, 0, 0);
        }

        //Request Animation Frame function
        var sFilter = function() {
            if (video.paused || video.ended) return;

            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(video, 0, 0, w, h);

            ncnn_nanodet();

            window.requestAnimationFrame(sFilter);
        }
  });

// IMAGE INFERENCING ###############################################################################################

    document.getElementById("imgButton").addEventListener("click", function() {
        var w = 1000;
        var h = 1000;
        var img_w = w;
        var img_h = h;
        var dst = null;
        console.log('IMAGE STATE');
        if (isStreaming){
            stream.getTracks().forEach(t => {
                t.stop();
            video.pause();
        });
        }
        // Hide
        $("#img").addClass('d-none');
        $("#video").addClass('d-none');
        // document.getElementById('img').style.display = 'none';

        // Display
        $("#myForm").removeClass('d-none');
        $("#predict").removeClass('d-none').show();


        function updateThumbnail(dropZoneElement, file) {
            let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

            // First time - remove the prompt
            if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
            }

            // First time - there is no thumbnail element, so lets create it
            if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
            }

            thumbnailElement.dataset.label = file.name;  //dataset exposes map of strings with an entry for each data-* attr

            // Show thumbnail for image files
            if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                const readerResult =  reader.result;
                thumbnailElement.style.backgroundImage = `url('${readerResult}')`;  // reader.result base64 data url representing the img

                imgURL = readerResult.toString()
                myimg.src = imgURL;
                // console.log(imgURL.slice(0,150));
            };

            } else {
            thumbnailElement.style.backgroundImage = null;
            }
        }

        // This is the promise code, so this is the useful bit
        function ensureURLSet(timeout) {
            var start = Date.now();
            return new Promise(waitForURL); // set the promise object within the ensureURLSet object

            // waitForURL makes the decision whether the condition is met
            // or not met or the timeout has been exceeded which means
            // this promise will be rejected
            function waitForURL(resolve, reject) {
                if (imgURL)
                    resolve(imgURL);
                else if (timeout && (Date.now() - start) >= timeout)
                    reject(new Error("timeout"));
                else
                    setTimeout(waitForURL.bind(this, resolve, reject), 30);
            }  // END waitForURL
        }  // END ensureURLSet

        function resizeImage(img_w, img_h) {
            if (img_w > w && img_h > h){
                if (img_w >= img_h) {
                    img_h = img_h / (img_w / w);
                    img_w = w;
                    console.log('width bigger', img_w, img_h);

                } else {
                    img_w = img_w / (img_h / h);
                    img_h = h;
                    console.log('height bigger', img_w, img_h);

                }
            } else if (img_w >= w){
                img_h = img_h / (img_w / w);
                img_w = w;
                console.log('width too large', w, img_h);
            } else if (img_h >= h){
                img_w = img_w / (img_h / h);
                img_h = h;
                console.log('height too large', img_w, h);
            }
            img_w = Math.floor(img_w);
            img_h = Math.floor(img_h);
            return {img_w , img_h};
        }
        // Drag and drop stuff
        document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
            const dropZoneElement = inputElement.closest(".drop-zone");  // Element.closest()

            dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
            });

            inputElement.addEventListener("change", (e) => {
            // console.log('file count');
            // console.log(inputElement.files[0]);
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);  // supports one file upload

            }
            });

            dropZoneElement.addEventListener("dragover", (e) => {  // EventTarget.addEventListener(type, listener)
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");  // Add another class - changes to solid line when file dragged over
            });

            ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");  // remove solid line class
            });
            });

            dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove("drop-zone--over");
            });
        });

            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');
            canvas.setAttribute('width', w);
            canvas.setAttribute('height', h);


        // This runs the promise code
        ensureURLSet(timeout).then(function(){
            //Setup image memory
            // img_w = myimg.width;
            // img_h = myimg.height;
            resized_obj = resizeImage(myimg.width, myimg.height);
            img_w = resized_obj.img_w;
            img_h = resized_obj.img_h;
            console.log(resized_obj);
            console.log("resized",img_w, img_h);


            var id = ctx.getImageData(0, 0, img_w, img_h);
            var d = id.data;

            if (wasmModuleLoaded) {
            mallocAndCallSFilter();
            } else {
            wasmModuleLoadedCallbacks.push(mallocAndCallSFilter);
            }

            function mallocAndCallSFilter() {
            if (dst != null)
            {
                console.log('dst not null');
                _free(dst);
                dst = null;
            }

            dst = _malloc(d.length);

            // wait until image dropped, then run inference
            sFilter();


            }

        });
        function ncnn_nanodet() {
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');

            var imageData = ctx.getImageData(0, 0, img_w, img_h);
            var data = imageData.data;

            HEAPU8.set(data, dst);

            _nanodet_ncnn(dst, img_w, img_h);

            var result = HEAPU8.subarray(dst, dst + data.length);
            imageData.data.set(result);
            ctx.putImageData(imageData, 0, 0);
        }

        //Request Animation Frame function
        var sFilter = function() {  // need sFilter function

            ctx.fillRect(0, 0, w, h);

            ctx.drawImage(myimg, 0, 0, img_w, img_h);

            ncnn_nanodet();

            document.getElementById("predict").addEventListener("click", function() {
                resized_obj = resizeImage(myimg.width, myimg.height);
                img_w = resized_obj.img_w;
                img_h = resized_obj.img_h;
                var id = ctx.getImageData(0, 0, img_w, img_h);
                var d = id.data;
                console.log(dst);
                if (dst != null)
                {
                    console.log('dst not null');
                    _free(dst);
                    dst = null;
                }

                dst = _malloc(d.length);
                window.requestAnimationFrame(sFilter);

        }, {once : true});
        }

        // var predictNextImage = function(){

        //     var id = ctx.getImageData(0, 0, img_w, img_h);
        //     console.log('image size',img_w,img_h );
        //     var d = id.data;

        //     _free(dst);
        //     dst = null;
        //     dst = _malloc(d.length);

        //     // wait until image dropped, then run inference
        //     ctx.fillRect(0, 0, w, h);

        //     resized_obj = resizeImage(myimg.width, myimg.height);
        //     img_w = resized_obj.img_w;
        //     img_h = resized_obj.img_h;
        //     ctx.drawImage(myimg, 0, 0, img_w, img_h);

        //     ncnn_nanodet();
        //     document.getElementById("predict").addEventListener("click", function() {
        //         console.log('request frame');
        //         window.requestAnimationFrame(predictNextImage);
        // }, {once : true});

        // }

    });
});
