默认情况下,所有的脚本和样式表都是通过框架代码读取的,这在一定程度上会影响执行效率.

因此建议正式环境采取缓存处理.

  1. 在www.aurora-framework.org上下载最新的程序 . 将resources.zip解压到web目录下
  1. 修改web.xml 去掉resource的servelt配置

这样不再通过框架来解析脚本和样式表,而是通过应用服务器来处理,这样可以缓存到本地.