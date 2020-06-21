using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Threading.Tasks;

namespace dondoCloudCore.Services
{
    public class FileUploader
    {
        private readonly string _bucketName;
        private readonly StorageClient _storageClient;

        public FileUploader(string bucketName)
        {
            _bucketName = bucketName;
            _storageClient = StorageClient.Create();
        }
        // [END bookshelf_cloud_storage_client]

        public async Task<Google.Apis.Storage.v1.Data.Object> UploadFile(IFormFile file, string id)
        {
            var fileAcl = PredefinedObjectAcl.PublicRead;
            var fileObject = await _storageClient.UploadObjectAsync(
                bucket: _bucketName,
                objectName: id.ToString(),
                contentType: file.ContentType,
                source: file.OpenReadStream(),
                options: new UploadObjectOptions { PredefinedAcl = fileAcl }
            );

            return fileObject;
        }
        public async Task Rename(string id, string newName)
        {
            await _storageClient.CopyObjectAsync(_bucketName, id, _bucketName,
                newName);
            await _storageClient.DeleteObjectAsync(_bucketName, id);
            var obj = await _storageClient.GetObjectAsync(_bucketName, newName);
            await _storageClient.UpdateObjectAsync(obj, new UpdateObjectOptions
            {
                PredefinedAcl = PredefinedObjectAcl.PublicRead
            });

        }
        public async Task DeleteUploadedFile(string id)
        {
            try
            {
                await _storageClient.DeleteObjectAsync(_bucketName, id.ToString());
            }
            catch (Google.GoogleApiException exception)
            {
                // A 404 error is ok.  The image is not stored in cloud storage.
                if (exception.Error.Code != 404)
                    throw;
            }
        }
        /*
        public IList<IFormFile> GetAllFiles()
        {
            IList<IFormFile> allfiles = null;
            foreach (var obj in _storageClient.ListObjects(_bucketName, ""))
            {
                allfiles.Add(obj as IFormFile);                
                Debug.WriteLine((obj as IFormFile).FileName);
            } 
            return allfiles;
        }
        */
        public List<Google.Apis.Storage.v1.Data.Object> GetAllFiles()
        {
            List<Google.Apis.Storage.v1.Data.Object> allfiles = new List<Google.Apis.Storage.v1.Data.Object>();
            foreach (var obj in _storageClient.ListObjects(_bucketName, ""))
            {
                allfiles.Add(obj);
                Debug.WriteLine(obj.Name);
            }
            return allfiles;
        }
    }
}
