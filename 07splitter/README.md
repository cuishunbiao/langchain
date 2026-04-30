## 文本切割
- 检索阶段以整篇文章为单位；
- 长文本会超出模型的 Token 限制；

查看 chunkviz.up.railway.app 效果；

- chunkSize: 每块的长度；
- chunkOverlap: 每块重叠长度；

## 不同类型
切分字符使用 RecursiveChartacterTextSplitter 来切割；
切分 Markdown 使用 MarkdownTextSplitter 来切割；

通过 fromLanguage 可以指定不同语言去做切分，比如 function 和 class 是不应该被切断的。会优先使用函数、类，来做区分。
指定语言以后，不会破坏语法结构，有利于大模型去理解。
