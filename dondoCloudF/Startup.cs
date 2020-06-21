using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Diagnostics.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace dondoCloudCore
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        /*
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });


            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }
        */
        //
        public void ConfigureServices(IServiceCollection services)
        {
            string bucketName = "deep-chimera-265215_bucket";
            services.AddSingleton<Services.FileUploader>(provider =>
                new Services.FileUploader(bucketName));
            
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseGoogleExceptionLogging();
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
                app.UseHttpsRedirection();
            }

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        public static string GetProjectId()
        {
            var envVar = Environment.GetEnvironmentVariable("GOOGLE_CLOUD_PROJECT");
            if (envVar != null)
            {
                return envVar;
            }
            // Use the service account credentials, if present.
            GoogleCredential googleCredential = Google.Apis.Auth.OAuth2
                .GoogleCredential.GetApplicationDefault();
            if (googleCredential != null)
            {
                ICredential credential = googleCredential.UnderlyingCredential;
                ServiceAccountCredential serviceAccountCredential =
                    credential as ServiceAccountCredential;
                if (serviceAccountCredential != null)
                {
                    return serviceAccountCredential.ProjectId;
                }
            }
            try
            {
                // Query the metadata server.
                HttpClient http = new HttpClient();
                http.DefaultRequestHeaders.Add("Metadata-Flavor", "Google");
                http.BaseAddress = new Uri(
                    @"http://metadata.google.internal/computeMetadata/v1/project/");
                return http.GetStringAsync("project-id").Result;
            }
            catch (AggregateException e)
            when (e.InnerException is HttpRequestException)
            {
                throw new Exception("Could not find Google project id.  " +
                    "Run this application in Google Cloud or follow these " +
                    "instructions to run locally: " +
                    "https://cloud.google.com/docs/authentication/getting-started",
                    e.InnerException);
            }
        }
    }
}
