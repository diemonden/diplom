// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
(function ($) {
    var chosen;
    var prev;
    var allfilenames;
    var allfileinfo;

    class FileInfo
    {
        name;
        updated;
        mediaLink;
        selfLink;
        size;
        contentType;

        constructor(name,
            updated,
            mediaLink,
            selfLink,
            size,
            contentType)
        {
            this.name = name;
            this.updated = updated;
            this.mediaLink = mediaLink;
            this.selfLink = selfLink;
            this.size = size;
            this.contentType = contentType;
        }
    }
    //форматированный вывод размера файлов
    function formatSize(length) {
        var i = 0, type = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб'];
        while ((length / 1000 | 0) && i < type.length - 1) {
            length /= 1024;
            i++;
        }
        return length.toFixed(2) + ' ' + type[i];
    }

    function addToTable(file) {
        allfilenames.push(file.name);
        var fileInfo = new FileInfo(file.name, file.updated, file.mediaLink,file.selfLink, file.size, file.contentType);
        allfileinfo.push(fileInfo);

        var img = document.createElement('img');
        img.className = "standart_icon";
        switch (file.contentType) {
            case "image/jpeg":
            case "image/png":
            case "image/pjpeg":
            case "image/bmp":
            case "image/svg+xml":
            case "image/webp":
                img.src = file.mediaLink;
                img.className = "image_file";
                break;
            case "text/plain":
                img.src = "/images/file_icons/txt.png"; break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            case "application/msword":
                img.src = "/images/file_icons/doc.png"; break;
            case "application/pdf":
                img.src = "/images/file_icons/pdf.png"; break;
            case "audio/mpeg":
                img.src = "/images/file_icons/mp3.png"; break;
            case "video/mp4":
                img.src = "/images/file_icons/mp4.png"; break;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            case "application/vnd.ms-excel":
                img.src = "/images/file_icons/excel.png"; break;
            default: img.src = "/images/file_icons/other_text.png"; break;
        }
        let div = document.createElement('div');
        div.className = "file_block";
        div.id = file.name;
        div.addEventListener("click", function (e) { choseFile(div); });
        div.addEventListener("dblclick", function (e) { openFile(div); });
        div.addEventListener("mouseover", function (e) {
            div.style.transform = "scale(1.15,1.15)";
            div.style.borderWidth = "4px";
        });
        div.addEventListener("mouseout", function (e) {
            div.style.transform = "scale(1.0,1.0)";
            if (chosen !== div)
                div.style.borderWidth = "1px";
        });
        div.innerHTML = '<div class="file_top">' +
            '</div><div class="file_bottom"><div class="file_name"><center>' +
            file.name + '</center></div></div>';
        $('main').append(div);
        div.querySelector('.file_top').append(img);
      
    }
    //загрузка файлов
    function uploadFiles(newfiles) {
        if (newfiles.length > 0) {
            if (window.FormData !== undefined) {
                var formData = new FormData();
                var sumSize = 0;
                for (var i = 0; i < newfiles.length; i++) {
                    if (!allfilenames.includes(newfiles[i].name)) {
                        formData.append("file" + i, newfiles[i]);
                        sumSize += Number(newfiles[i].size);
                    }
                }
                if (Number(sumSize) > 31457000)
                    alert("Ошибка.Файлы превышают размер 30мб");
                $.ajax({
                    type: "POST",
                    url: '/Home/Upload',
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: function (result) {
                        console.log("success");
                        result.forEach(function (item) { addToTable(item); });
                    },
                    error: function (xhr, status, p3) {
                        console.log("error");
                    }
                });
            } else {
                alert("Браузер не поддерживает загрузку файлов HTML5!");
            }
        }
        console.log(newfiles);
    }
    //удаление файла
    function delFromTable(file) {
        //front
        var id = allfilenames.indexOf(file.id);
        allfilenames.splice(id, 1);
        allfileinfo.splice(id, 1);
        file.remove();
        chosen = "";
        $("#file_info").hide();
        //ajax
        var formData = new FormData();
        formData.append("id", file.id);
        $.ajax({
            type: "POST",
            url: '/Home/Delete',
            contentType: false,
            processData: false,
            data: formData,
            success: function (result) {
                console.log("success");
            },
            error: function (xhr, status, p3) {
                console.log("error");
            }
        });

    }
    //переименование
    function rename(file) {
        var id = allfilenames.indexOf(file.id);
        var text = $('#rename_input').val();
        //
        var formData = new FormData();
        formData.append("id", file.id);
        formData.append("new_name", text);
        //
        allfilenames[id] = text;
        allfileinfo[id].name = text;
        document.getElementById("name").innerText = allfileinfo[id].name;
        file.id = text;
        chosen.querySelector("center").innerText = text;
        //
        $.ajax({
            type: "POST",
            url: '/Home/Rename',
            contentType: false,
            processData: false,
            data: formData,
            success: function (result) {
                console.log("success");
            },
            error: function (xhr, status, p3) {
                console.log("error");
            }
        });
    }
    
    function idk(d) {
        if (Number(d) > 10) {
            return d;
        } else {
            var dd = "0" + d;
            return dd;
        }
    }
    //выбор файла
    function choseFile(file) {
        if (chosen !== "") {
            prev = chosen;
            document.getElementById(prev.id).style.border = "1px darkgrey solid";
            prev.querySelector(".file_top").style.borderBottom = "1px darkgrey solid";
        }
        chosen = file;
        $("#file_info").show();
        document.getElementById(chosen.id).style.border = "4px solid darkslategrey";
        chosen.querySelector(".file_top").style.borderBottom = "3px dashed darkslategrey";
        document.getElementById("rename_input").value = chosen.id;
        var id = allfilenames.indexOf(chosen.id);
        document.getElementById("name").innerText = allfileinfo[id].name;
        document.getElementById("size").innerText = formatSize(allfileinfo[id].size);
        document.getElementById("type").innerText = allfileinfo[id].contentType;
        var date = new Date(allfileinfo[id].updated);
        document.getElementById("date").innerHTML = "Дата: " + idk(date.getDate()) + "." + idk(date.getMonth()) + "." + date.getFullYear() + "<br/>"
            + "Время: " + idk(date.getHours()) + "." + idk(date.getMinutes()) + ":" + idk(date.getSeconds());
    }
    //открыть файл (после бэка)
    function openFile(file) {
        $('#overlay').addClass('page-overlay_state_visible');
        var id = allfilenames.indexOf(file.id);
        switch (allfileinfo[id].contentType) {
            case "image/jpeg":
            case "image/png":
            case "image/pjpeg":
            case "image/bmp":
            case "image/svg+xml":
            case "image/webp":
                openImage(allfileinfo[id].mediaLink);
                 break;
            case "text/plain":
                openDefault();break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            case "application/msword":
                openDefault(); break;
            case "application/pdf":
                openPDF(allfileinfo[id].name); break;
            case "audio/mpeg":
                openAudio(allfileinfo[id].mediaLink); break;
            case "video/mp4":
                openVideo(allfileinfo[id].mediaLink); break;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            case "application/vnd.ms-excel":
                openDefault(); break;
            default: openDefault(); break;
        }
    }
    //
    function openVideo(src) {
        var video = document.createElement('video');
        video.controls = "true";
        var source = document.createElement('source');
        source.src = src;
        source.type = "video/mp4";
        video.append(source);
        $('#ov_content').append(video);
    }
    //
    function openAudio(src) {
        var audio = document.createElement('audio');
        audio.controls = "true";
        audio.style.width = "50%";
        var source = document.createElement('source');
        source.src = src;
        source.type = "audio/mpeg";
        audio.append(source);
        $('#ov_content').append(audio);
    }
    //
    function openImage(src) {
        var img = document.createElement('img');
        img.src = src;
        $('#ov_content').append(img);
    }
    //
    function openPDF(name) {
        var embed = document.createElement('embed');
        embed.src = "https://storage.cloud.google.com/deep-chimera-265215_bucket/" + name + "?hl=ru";
        embed.style.width = "80%";
        embed.style.height = "100%";
        $('#ov_content').append(embed);
    }
    
    //todo
    function openDoc(name) {
    }
    //todo
    function openText(name) {
    }
    //excel
    function openExcel(name) {
    }
    function openDefault() {
        alert('Формат не поддерживается. Загрузите файл и откройте на вашем устройстве');
        $('#overlay').removeClass('page-overlay_state_visible');
    }
    //поиск
    function search(searchString) {
        var formData = new FormData();
        formData.append("searchString", searchString);
        $.ajax({
            type: "POST",
            url: '/Home/Search',
            contentType: false,
            processData: false,
            data: formData,
            success: function (result) {
                $('main').empty();
                result.forEach(function (item) { addToTable(item); });
            },
            error: function (xhr, status, p3) {
                console.log("error");
            }
        });
    }
    //jQuery events
    $(document).ready(function () {
        chosen = "";
        allfilenames = [];
        allfileinfo = [];
        //загрузка всех файлов в жс
        $.ajax({
            type: "POST",
            url: '/Home/GetAllFileInfo',
            contentType: false,
            processData: false,
            data: false,
            success: function (result) {
                allfileinfo = result;
                for (var i = 0; i < allfileinfo.length; i++)
                    allfilenames[i] = allfileinfo[i].name;
                    result.forEach(function (item) { addToTable(item); });
            },
            error: function (xhr, status, p3) {
                console.log("error");
            }
        });
        //открытие окна добавления файла
        $('#add_button').click(function () {
            $('#file-input').trigger('click');
        });
        //при добавлении файла
        
        $('#file-input').change(function (e) {
            uploadFiles(this.files);
        });
        //загрузка файла
        $('#download_button').click(function () {
            var id = allfilenames.indexOf(chosen.id);
            var src = allfileinfo[id].mediaLink;
            var link = document.createElement('a');
            link.setAttribute('href', src);
            link.setAttribute('download', src);
            link.click();
        });
        //удаление
        $('#del_button').click(function () {
            delFromTable(chosen);
        });
        //переименование
        $('#rename_button').click(function () {
            rename(chosen);
        });
        //драг&дроп
        const dropArea = document.getElementById('file_drop');

        dropArea.addEventListener('dragenter', (event) => {
            event.stopPropagation();
            event.preventDefault();
            dropArea.style.border = "2px darkgrey dashed";
        });

        dropArea.addEventListener('dragleave', (event) => {
            event.stopPropagation();
            event.preventDefault();
            dropArea.style.border = "1px darkgrey solid";
        });

        dropArea.addEventListener('dragover', (event) => {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });

        dropArea.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            uploadFiles(event.dataTransfer.files);
        });
        //маусоверы
        $('.file_block').on("mouseover", function () {
            this.style.transform = "scale(1.15,1.15)";
            this.style.borderWidth = "4px";
        });
        $('.file_block').on("mouseout", function () {
            this.style.transform = "scale(1.0,1.0)";
            if (chosen !== this)
                this.style.borderWidth = "1px";
        });
        $('.file_block').on("click", function () {
            choseFile(this);
        });
        //поиск
        $('#search_input').on("input", function () {
            search($('#search_input').val());
        });
        //закрыть оверлей
        $('#cross').on("click", function () {
            $('#ov_content').empty();
            $('#overlay').removeClass('page-overlay_state_visible');
        });
        //
        $('.ac_pic').on("click", function () {
            $('#ac_infoblock').toggle();
        });
    });
})(jQuery);
