## 简介 ##

Aurora的日志启用和查看，都将在登录系统后直接操作即可，不再需要修改页面源码。这种操作方式使跟踪、调式和纠错整个流程更加简单、快速。

## 安装 ##

  * 从[aurora-framework](http://www.aurora-framework.org/release/)上下载2011-9-1后的aurora.jar版本
  * 打开[web-home]/WEB-INF/service-logging.config,在service-logging标签中，添加enablePerServiceConfig="true"，如
```
<ns1:service-logging xmlns:ns1="aurora.application.features" 
append="false" defaultLogLevel="FINE" 
enablePerServiceConfig="true" 
logPath="[web-home]\logs" pattern="_${/session/@session_id}_">
```

## 启用日志 ##
  * 登录系统
  * 打开modules/sys/sys\_log.screen,这个页面分为两部分。分别是系统和明细。如图：
> > ![http://aurora-project.googlecode.com/svn/wiki/images/sys_log.png](http://aurora-project.googlecode.com/svn/wiki/images/sys_log.png)
    * 系统：是否对所有文件启用日志
    * 明细：分为screen、svc和bm。点击查询后，会把所有的相关文件，以及它的日志启用状态查询出来。另提供了一个清除所有配置的按钮，可以一键清除所有设置过的日志，包括screen、svc和bm。
## 查看当前页面日志 ##

> 进入系统后，打开需要查看的日志的页面，在工具栏上点击“系统日志”一栏，在弹出的窗口中会显示当前打开的screen文件清单。可以对这些文件管理是否启用日志，有日志文件的screen，可以点击日志查看，直接在线查看日志内容。