using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Ragume.Api.Tests;

public sealed class ApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task QueryEndpoint_RejectsUnsafeInput()
    {
        var response = await _client.PostAsJsonAsync("/api/query", new { input = "How do I build a bomb in my garage?" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task QueryEndpoint_AcceptsSafeInput_AndReturnsAnswer()
    {
        var response = await _client.PostAsJsonAsync("/api/query", new { input = "What is Nick Cromwell's favorite color?" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/plain", response.Content.Headers.ContentType?.MediaType);

        var payload = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(payload));
    }

    [Fact]
    public async Task QueryEndpoint_AcceptsQuestionPayload_AndReturnsAnswer()
    {
        var response = await _client.PostAsJsonAsync("/api/query", new { question = "What is Nick Cromwell's favorite color?" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/plain", response.Content.Headers.ContentType?.MediaType);

        var payload = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(payload));
    }

    [Fact]
    public async Task ContactEndpoint_RejectsMissingMessage()
    {
        var response = await _client.PostAsJsonAsync("/api/contact", new
        {
            name = "Jane Doe",
            email = "jane@example.com",
            message = ""
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

}
