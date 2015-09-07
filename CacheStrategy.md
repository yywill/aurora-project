## 与cache操作有关的action ##

  * `<cache-read cacheName="somecache" key="somekey" dataPath="/model/mypath">` cache读取
  * `<cache-write cacheName="somecache" key="somekey" dataPath="/model/mypath">` cache写入

## 自给自足模式 ##

  * 用`<cache-read>`读取
  * 在`<cache-read>`中包含`<cache-missing>`，定义cache无法获取时的操作
  * 如果没有取到cache，则将`<cache-missing>`产生的内容写入到cache

## 定期更新模式 ##

  * 写一个svc完成cache数据的获取及写入
  * 配置定期job，调用此svc实现cache的更新

## 触发更新模式 ##

  * 数据维护者在更新完数据后，发送一个需更新某个cache数据的消息
  * 接收到这个消息后，执行cache数据的获取及写入