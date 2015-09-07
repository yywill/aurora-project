## JVM启动参数 ##
在JVM启动参数中增加以下内容：
```
-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=1044
```
其中，address是远程debug服务所使用的端口，必须是一个空闲端口号。
对于Tomcat，可以在startup.sh中设置JAVA\_OPTS环境变量，增加上述参数。


## 在Eclipse中连接远程JVM ##

Eclipse中选择Run `->` Debug configurations，选中Remote java applications，再点工具栏上的新增按钮。
在Connection properties中，输入host和port，分别对应主机的IP地址，和前面步骤中启用的端口号。
在source这一页，点add->java project，将包含要调试的源代码的项目加入进去。

然后点debug，再切换到Debug perspective，即可对远程JVM开始调试，