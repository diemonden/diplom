using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace dondoCloudCore.Models
{
    public class FileInfo
    {
        public string name { get; set; }
        public DateTime? updated { get; set; }
        public string mediaLink { get; set; }
        public string selfLink { get; set; }
        public ulong? size { get; set; }
        public string contentType { get; set; }
    }
}
