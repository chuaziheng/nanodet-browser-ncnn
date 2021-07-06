// global vars
var imgURL = '';
var myimg = document.getElementById('img');
var timeout = 1000000;
var webcamState = false;

// Set states
function imageState(){
    webcamState = false;
}

function webcamState(){
    webcamState = true;
    document.getElementById('myForm').display = "none";
}

// Image inferencing
if (!webcamState) {
    console.log('IMAGE STATE');
    function requestFrame(){
        window.requestAnimationFrame(sFilter);  // it keeps

    }
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
            // console.log(imgURL);
          };

        } else {
          thumbnailElement.style.backgroundImage = null;
        }
      }

      // This is the promise code, so this is the useful bit
      function ensureFooIsSet(timeout) {
        var start = Date.now();
        return new Promise(waitForFoo); // set the promise object within the ensureFooIsSet object

        // waitForFoo makes the decision whether the condition is met
        // or not met or the timeout has been exceeded which means
        // this promise will be rejected
        function waitForFoo(resolve, reject) {
            if (imgURL)
                resolve(imgURL);
            else if (timeout && (Date.now() - start) >= timeout)
                reject(new Error("timeout"));
            else
                setTimeout(waitForFoo.bind(this, resolve, reject), 30);
        }  // END waitForFoo
    }  // END ensureFooIsSet

    // Drag and drop stuff
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");  // Element.closest()

        dropZoneElement.addEventListener("click", (e) => {
          inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
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

      /**
       * Updates the thumbnail on a drop zone element.
       *
       * @param {HTMLElement} dropZoneElement
       * @param {File} file
       */


    // Original repo stuff

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

    window.addEventListener('DOMContentLoaded', function() {
        // var isStreaming = false;
        // switchcamerabtn = document.getElementById('switch-camera-btn');
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        canvas.setAttribute('width', w);
        canvas.setAttribute('height', h);

        // document.getElementById('img').src = './testimg.jpg'
        // Wait until the video stream canvas play
        // video.addEventListener('canplay', function(e) {
        //     if (!isStreaming) {
        //         // videoWidth isn't always set correctly in all browsers
        //         if (video.videoWidth > 0) h = video.videoHeight / (video.videoWidth / w);
        //         canvas.setAttribute('width', w);
        //         canvas.setAttribute('height', h);
        //         isStreaming = true;
        //     }
        // }, false);

        // Wait for the video to start to play
        // video.addEventListener('play', function() {
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
        // console.log('Waiting for URL');
        // console.log(imgURL);

        // This runs the promise code
        ensureFooIsSet(timeout).then(function(){  // wait until image dropped, then run inference
            sFilter();
        });

        }
        // });

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
    });

    // function capture() {
    //     var constraints = { audio: false, video: { width: 640, height: 480, facingMode: shouldFaceUser ? 'user' : 'environment' } };
    //     navigator.mediaDevices.getUserMedia(constraints)
    //         .then(function(mediaStream) {
    //             var video = document.querySelector('video');
    //             stream = mediaStream;
    //             video.srcObject = mediaStream;
    //             video.onloadedmetadata = function(e) {
    //                 video.play();
    //             };
    //         })
    //         .catch(function(err) {
    //             console.log(err.message);
    //         });
    // }


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
    var sFilter = function() {  // need sFilter function
        // if (video.paused || video.ended) return;

        ctx.fillRect(0, 0, w, h);

        ctx.drawImage(myimg, 0, 0, w, h);

        ncnn_nanodet();
        // window.requestAnimationFrame(sFilter);  // it keeps


    }

} else{
    console.log("WEBCAM STATE");
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
    window.addEventListener('DOMContentLoaded', function() {
        var isStreaming = false;
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
    });

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

}
// function requestFrame(){
//     window.requestAnimationFrame(sFilter);  // it keeps

// }
// function updateThumbnail(dropZoneElement, file) {
//     let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

//     // First time - remove the prompt
//     if (dropZoneElement.querySelector(".drop-zone__prompt")) {
//       dropZoneElement.querySelector(".drop-zone__prompt").remove();
//     }

//     // First time - there is no thumbnail element, so lets create it
//     if (!thumbnailElement) {
//       thumbnailElement = document.createElement("div");
//       thumbnailElement.classList.add("drop-zone__thumb");
//       dropZoneElement.appendChild(thumbnailElement);
//     }

//     thumbnailElement.dataset.label = file.name;  //dataset exposes map of strings with an entry for each data-* attr

//     // Show thumbnail for image files
//     if (file.type.startsWith("image/")) {
//       const reader = new FileReader();

//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const readerResult =  reader.result;
//         thumbnailElement.style.backgroundImage = `url('${readerResult}')`;  // reader.result base64 data url representing the img
//         imgURL = readerResult.toString()
//         myimg.src = imgURL;
//         console.log(imgURL);
//       };

//     } else {
//       thumbnailElement.style.backgroundImage = null;
//     }
//   }

//   // This is the promise code, so this is the useful bit
//   function ensureFooIsSet(timeout) {
//     var start = Date.now();
//     return new Promise(waitForFoo); // set the promise object within the ensureFooIsSet object

//     // waitForFoo makes the decision whether the condition is met
//     // or not met or the timeout has been exceeded which means
//     // this promise will be rejected
//     function waitForFoo(resolve, reject) {
//         if (imgURL)
//             resolve(imgURL);
//         else if (timeout && (Date.now() - start) >= timeout)
//             reject(new Error("timeout"));
//         else
//             setTimeout(waitForFoo.bind(this, resolve, reject), 30);
//     }  // END waitForFoo
// }  // END ensureFooIsSet

// // Drag and drop stuff
// document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
//     const dropZoneElement = inputElement.closest(".drop-zone");  // Element.closest()

//     dropZoneElement.addEventListener("click", (e) => {
//       inputElement.click();
//     });

//     inputElement.addEventListener("change", (e) => {
//       if (inputElement.files.length) {
//         updateThumbnail(dropZoneElement, inputElement.files[0]);  // supports one file upload
//       }
//     });

//     dropZoneElement.addEventListener("dragover", (e) => {  // EventTarget.addEventListener(type, listener)
//       e.preventDefault();
//       dropZoneElement.classList.add("drop-zone--over");  // Add another class - changes to solid line when file dragged over
//     });

//     ["dragleave", "dragend"].forEach((type) => {
//       dropZoneElement.addEventListener(type, (e) => {
//         dropZoneElement.classList.remove("drop-zone--over");  // remove solid line class
//       });
//     });

//     dropZoneElement.addEventListener("drop", (e) => {
//       e.preventDefault();
//       if (e.dataTransfer.files.length) {
//         inputElement.files = e.dataTransfer.files;
//         updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
//       }

//       dropZoneElement.classList.remove("drop-zone--over");
//     });
//   });

//   /**
//    * Updates the thumbnail on a drop zone element.
//    *
//    * @param {HTMLElement} dropZoneElement
//    * @param {File} file
//    */


// // Original repo stuff

// var Module = {};

// var has_simd;
// var has_threads;

// var wasmModuleLoaded = false;
// var wasmModuleLoadedCallbacks = [];

// Module.onRuntimeInitialized = function() {
//     wasmModuleLoaded = true;
//     for (var i = 0; i < wasmModuleLoadedCallbacks.length; i++) {
// 	wasmModuleLoadedCallbacks[i]();
//     }
// }

// wasmFeatureDetect.simd().then(simdSupported => {
//     has_simd = simdSupported;

//     wasmFeatureDetect.threads().then(threadsSupported => {
// 	has_threads = threadsSupported;

// 	if (has_simd)
// 	{
// 	    if (has_threads)
// 	    {
// 		nanodet_module_name = 'nanodet-simd-threads';
// 	    }
// 	    else
// 	    {
// 		nanodet_module_name = 'nanodet-simd';
// 	    }
// 	}
// 	else
// 	{
// 	    if (has_threads)
// 	    {
// 		nanodet_module_name = 'nanodet-threads';
// 	    }
// 	    else
// 	    {
// 		nanodet_module_name = 'nanodet-basic';
// 	    }
// 	}

// 	console.log('load ' + nanodet_module_name);

// 	var nanodetwasm = './build/' + nanodet_module_name + '.wasm';
// 	var nanodetjs = './build/' + nanodet_module_name + '.js';

// 	fetch(nanodetwasm)
// 	    .then(response => response.arrayBuffer())
// 	    .then(buffer => {
// 		Module.wasmBinary = buffer;
// 		var script = document.createElement('script');
// 		script.src = nanodetjs;
// 		script.onload = function() {
// 		    console.log('Emscripten boilerplate loaded.');
// 		}
// 		document.body.appendChild(script);
// 	    });

//     });
// });


// var shouldFaceUser = true;
// var stream = null;
// var w = 640;
// var h = 480;

// var dst = null;
// var resultarray = null;
// var resultbuffer = null;

// window.addEventListener('DOMContentLoaded', function() {
//     // var isStreaming = false;
//     // switchcamerabtn = document.getElementById('switch-camera-btn');
//     canvas = document.getElementById('canvas');
//     ctx = canvas.getContext('2d');
//     canvas.setAttribute('width', w);
//     canvas.setAttribute('height', h);

//     // document.getElementById('img').src = './testimg.jpg'
//     // Wait until the video stream canvas play
//     // video.addEventListener('canplay', function(e) {
//     //     if (!isStreaming) {
//     //         // videoWidth isn't always set correctly in all browsers
//     //         if (video.videoWidth > 0) h = video.videoHeight / (video.videoWidth / w);
//     //         canvas.setAttribute('width', w);
//     //         canvas.setAttribute('height', h);
//     //         isStreaming = true;
//     //     }
//     // }, false);

//     // Wait for the video to start to play
//     // video.addEventListener('play', function() {
// 	//Setup image memory
//     var id = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     var d = id.data;

//     if (wasmModuleLoaded) {
// 	mallocAndCallSFilter();
//     } else {
// 	wasmModuleLoadedCallbacks.push(mallocAndCallSFilter);
//     }

//     function mallocAndCallSFilter() {
// 	if (dst != null)
// 	{
// 	    _free(dst);
// 	    dst = null;
// 	}

// 	dst = _malloc(d.length);

// 	//console.log("What " + d.length);
//     // console.log('Waiting for URL');
//     // console.log(imgURL);

//     // This runs the promise code
//     ensureFooIsSet(timeout).then(function(){  // wait until image dropped, then run inference
// 	    sFilter();
//     });

// 	}
//     // });

//     // check whether we can use facingMode
// 	var supports = navigator.mediaDevices.getSupportedConstraints();
// 	if (supports['facingMode'] === true) {
// 	    switchcamerabtn.disabled = false;
// 	}

// 	switchcamerabtn.addEventListener('click', function() {
// 	    if (stream == null)
// 		return

// 	    stream.getTracks().forEach(t => {
// 		t.stop();
// 	    });

// 	    shouldFaceUser = !shouldFaceUser;
// 	    capture();
// 	});

// 	capture();
// });

// // function capture() {
// //     var constraints = { audio: false, video: { width: 640, height: 480, facingMode: shouldFaceUser ? 'user' : 'environment' } };
// //     navigator.mediaDevices.getUserMedia(constraints)
// //         .then(function(mediaStream) {
// //             var video = document.querySelector('video');
// //             stream = mediaStream;
// //             video.srcObject = mediaStream;
// //             video.onloadedmetadata = function(e) {
// //                 video.play();
// //             };
// //         })
// //         .catch(function(err) {
// //             console.log(err.message);
// //         });
// // }


// function ncnn_nanodet() {
//     var canvas = document.getElementById('canvas');
//     var ctx = canvas.getContext('2d');

//     var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     var data = imageData.data;

//     HEAPU8.set(data, dst);

//     _nanodet_ncnn(dst, canvas.width, canvas.height);

//     var result = HEAPU8.subarray(dst, dst + data.length);
//     imageData.data.set(result);
//     ctx.putImageData(imageData, 0, 0);
// }

// //Request Animation Frame function
// var sFilter = function() {  // need sFilter function
//     // if (video.paused || video.ended) return;

//     ctx.fillRect(0, 0, w, h);

//     ctx.drawImage(myimg, 0, 0, w, h);

//     ncnn_nanodet();
//     // window.requestAnimationFrame(sFilter);  // it keeps


// }
