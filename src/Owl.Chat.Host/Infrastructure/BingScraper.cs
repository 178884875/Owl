using System.IO.Compression;
using System.Web;
using HtmlAgilityPack;
using Owl.Chat.Host.Dto;

namespace Owl.Chat.Host.Infrastructure;

public class BingScraper(IHttpClientFactory httpClientFactory)
{
    /// <summary>
    /// 异步爬取 Bing 搜索结果
    /// </summary>
    /// <param name="query">搜索关键词</param>
    /// <returns>搜索结果列表</returns>
    public async Task<SearchResults> ScrapeAsync(string query)
    {
        // 构造 Bing 搜索 URL，编码查询参数
        var url = $"https://www.bing.com/search?q={HttpUtility.UrlEncode(query)}";
        var client = httpClientFactory.CreateClient(nameof(BingScraper));

        // 发送 HTTP GET 请求，获取 HTML 内容
        var response = await client.GetAsync(url);

        var html = "";

        // 判断是否需要解压缩
        if (response.Content.Headers.ContentEncoding.Contains("gzip"))
        {
            await using var stream =
                new GZipStream(await response.Content.ReadAsStreamAsync(), CompressionMode.Decompress);
            using var reader = new StreamReader(stream);
            html = await reader.ReadToEndAsync();
        }
        // br
        else if (response.Content.Headers.ContentEncoding.Contains("br"))
        {
            await using var stream =
                new BrotliStream(await response.Content.ReadAsStreamAsync(), CompressionMode.Decompress);
            using var reader = new StreamReader(stream);
            html = await reader.ReadToEndAsync();
        }
        else
        {
            html = await response.Content.ReadAsStringAsync();
        }


        // 使用 HtmlAgilityPack 解析 HTML
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // 初始化搜索结果列表
        var results = new List<SearchResultDto>();

        // 选择搜索结果节点（Bing 的搜索结果通常在 <li class="b_algo"> 元素中）
        var nodes = doc.DocumentNode.SelectNodes("//li[@class='b_algo']");
        if (nodes != null)
        {
            foreach (var node in nodes)
            {
                // 提取标题（在 <h2><a>...</a></h2> 中）
                var titleNode = node.SelectSingleNode(".//h2/a");
                // 提取 URL（从标题链接的 href 属性中获取）
                var urlNode = titleNode?.Attributes["href"]?.Value;
                // 提取摘要（在 <p> 标签中）
                var snippetNode = node.SelectSingleNode(".//p");

                // 确保提取的字段有效
                if (titleNode != null && urlNode != null && snippetNode != null)
                {
                    // 将urlNode转移
                    urlNode = HttpUtility.HtmlDecode(urlNode);
                    results.Add(new SearchResultDto
                    {
                        Title = titleNode.InnerText,
                        Url = urlNode,
                        Snippet = snippetNode.InnerText
                    });
                }
            }
        }

        // 返回搜索结果
        return new SearchResults { Results = results };
    }
}

public class SearchResults
{
    public List<SearchResultDto> Results { get; set; } = new();
}
