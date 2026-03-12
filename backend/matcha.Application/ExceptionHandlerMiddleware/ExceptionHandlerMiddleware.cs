using matcha.Application.Exceptions;
using matcha.Application.ResponseWrappers;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;

namespace matcha.Application.ExceptionHandlerMiddleware
{
    public class ExceptionHandlerMiddleware : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                var response = new Response<string>("", false);
                switch (ex)
                {
                    case ValidationException validationException:
                        context.Response.StatusCode = 403;
                        var validationResponse = new
                        {
                            message = validationException.Message,
                            statusCode = 403,
                            errors = validationException.Errors,
                            innerExceptionMessage = ex.InnerException?.Message

                        };
                        await context.Response.WriteAsync(JsonSerializer.Serialize(validationResponse));
                        break;

                    case NotFoundException:
                        context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                        response.Message = ex.Message;
                        response.StatusCode = (int)HttpStatusCode.NotFound;
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        break;

                    case UnauthorizedException:
                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        response.Message = ex.Message;
                        response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        break;

                    case ApiException apiException:
                        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                        response.Message = ex.Message;
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        break;

                    default:
                        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        response.Message = "Internal server error";
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        Console.WriteLine($"[500] {ex.GetType().Name}: {ex.Message}\n{ex.StackTrace}");
                        if (ex.InnerException != null)
                            Console.WriteLine($"Inner: {ex.InnerException.Message}");
                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        break;
                }
            }
        }
    }
}
