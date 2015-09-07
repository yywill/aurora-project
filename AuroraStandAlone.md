# 什么是独立的Aurora应用 #

独立的Aurora应用只依赖于Aurora的内部引擎功能。它不需要Tomcat等各种web服务器而独立存在。


# 什么时候需要采用独立的Aurora应用 #

独立的Aurora应用适用于任何无需与web页面交互的后台应用。譬如与SAP交互的IDoc功能，定时触发事件等功能。它有效的分离了Web系统和后台系统，增强了系统的健壮性和稳定性。

# 如何部署一个独立的Aurora应用 #

部署后的主目录有如下结构：

  * bin/
    * startup.bat（或其它OS脚本，必须）
    * shutdown.bat（或其它OS脚本，必须）
> > 以下是其它特性所需要的辅助文件
    * MYSERVER.jcoServer
    * BCE.jcoDestination
  * WEB-INF/
    * lib（必须）
      * aurora.jar
      * classes12.jar（JDBC驱动）
      * 其他jar包
    * 0.datasource.config（必须）
    * aurora.config（必须）
    * database-config.config（必须）
    * uncertain.xml（必须）
    * idoc.config

这个结构跟tomcat的结构基本类似，仅稍有不同：bin目录是跟web-inf目录是同级的，并减少了很多其他目录和文件。用户只需把自定义的config文件放入web-inf下，把jar包放入lib下，并把其他资源（如果需要）放入bin目录下，部署即完成。

## 启动 ##

> 进入bin目录，运行startup.bat或startup.sh文件
## 停止 ##
> 进入bin目录，运行shutdown.bat或shutdown.sh文件。
## 查看日志 ##
> 查看uncertain.xml中定义的log目录。

附：
startup.bat和shutdown.bat文件在此下载
http://code.google.com/p/aurora-project/downloads/detail?name=bin.zip&can=2&q=