namespace Thor.Chat.Host.Prompts;

public class BingPrompt
{
    public const string Search = """
                                 下面是搜索引擎搜索结果，如果用户提问的问题在搜索结果中，请参考搜索结果回答用户问题，在回复用户时请标注搜索引擎搜索结果来源，以便用户参考,如果需要引用搜索内容，最好使用引用格式，例如：![引用](引用链接)，最好不要出现图片和广告内容。
                                 {{$searchResult}}
                                 """;
}