using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using dondoCloudCore.Models;
using dondoCloudCore.Services;
using Microsoft.AspNetCore.Http;
using Google.Apis.Docs;

namespace dondoCloudCore.Controllers
{
    public class HomeController : Controller
    {
        //private readonly IFileStore _store;
        private readonly FileUploader _fileUploader;
        public List<Google.Apis.Storage.v1.Data.Object> _allFiles = new List<Google.Apis.Storage.v1.Data.Object>();
        
        public HomeController(FileUploader fileUploader)
        {
            //_store = store;
            _fileUploader = fileUploader;
            _allFiles = _fileUploader.GetAllFiles();
            //_allFiles = new List<Google.Apis.Storage.v1.Data.Object>();
        }
        [HttpPost]
        public JsonResult GetAllFileNames()
        {
            List<string> _allFileNames = new List<string>();
            foreach (var obj in _allFiles)
                _allFileNames.Add(obj.Name);
            return Json(_allFileNames);
        }
        [HttpPost]
        public JsonResult GetAllFileInfo()
        {
            List<FileInfo> _allFileInfo = new List<FileInfo>();
            foreach (var obj in _allFiles) {
                FileInfo file = new FileInfo();
                file.name = obj.Name;
                file.size = obj.Size;
                file.mediaLink = obj.MediaLink;
                file.updated = obj.Updated;
                file.contentType = obj.ContentType;
                file.selfLink = obj.SelfLink;
                _allFileInfo.Add(file);
            }
            return Json(_allFileInfo);
        }
        [HttpPost]      
        public async Task<JsonResult> Upload()
        {
            List<Google.Apis.Storage.v1.Data.Object> _newfiles = new List<Google.Apis.Storage.v1.Data.Object>();
            foreach (var file in Request.Form.Files)
            {
                if (file != null)
                {
                    var newfile = await _fileUploader.UploadFile(file, file.FileName);
                    _newfiles.Add(newfile);
                }
            }
            return Json(_newfiles);
        }
        [HttpPost]
        public async Task<IActionResult> Delete()
        {
            var id = Request.Form.First(p => p.Key == "id").Value;
            await _fileUploader.DeleteUploadedFile(id);
            return RedirectToAction("Index");
        }
        [HttpPost]
        public async Task<JsonResult> Rename()
        {
            var id = Request.Form.First(p => p.Key == "id").Value;
            var new_name = Request.Form.First(p => p.Key == "new_name").Value;
            await _fileUploader.Rename(id, new_name);
            return Json(new_name);
        }
        [HttpPost]
        public async Task<JsonResult> Search()
        {
            string searchString = Request.Form.First(p => p.Key == "searchString").Value;
            var _searched = _allFiles.Where(s => s.Name.ToUpper().Contains(searchString.ToUpper()));
            return Json(_searched);
        }
        public IActionResult Index(string type, string searchString = null)
        {
            return View();
        }
        public IActionResult Login()
        {
            return View();
        }
        public IActionResult Registration()
        {
            //Session["NewUser"] = 0;
            return View();
        }
        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
