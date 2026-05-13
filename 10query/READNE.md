# 向量检索优化

## MultiQueryRetriever
把用户的问题改写成多个角度描述的问题。

### 召回率（Recall）
指的是所有相关内容中被成功检索出来的比例。公式为：
```
召回率 = 检索到的相关内容数量 / 所有实际相关内容的总数
```
## ContextualCompressionRetriever
检索后处理。
检索出相关文档以后，过滤掉不相关的部分，返回更简洁的文档片段。


## ScoreThresholdRetriever
基于「阀值」的过滤器，通过一个「相似度分数」来控制输出质量。