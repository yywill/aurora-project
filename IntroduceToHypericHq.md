## 简介 ##
[Hyperic HQ](http://www.hyperic.com/)是一个开源(GPL授权)IT资源管理平台。它提供了友好的图形化界面，显示各种资源的配置和运行时参数，并可以存储数据到数据库中。还可以设置警告条件，并在条件满足时发送邮件通知管理员。
Hyperic HQ 可以监控和管理多种资源类型:
  * 操作系统：AIX，HP/UX，Linux，Solaris，Windows，Mac OSX，FreeBSD
  * Web服务器：Apache，Microsoft IIS，Sun ONE Web Server
  * 应用服务器：BEA WebLogic，IBM WebSphere，JBoss，Apache Geronimo，Macromedia  ColdFusion，Macromedia JRun，Microsoft .NET Runtime，Novell Silverstream，Tomcat，Caucho Resin
  * 数据库：IBM DB2，Microsoft SQL Server，MySQL，Oracle，PostgreSQL，Sybase Adaptive Server
  * 消息中间件: ActiveMQ，Weblogic MQ
  * 微软的产品: MS Exchange，MS ActiveDirectory，.NET
  * 虚拟产品: VMWare，Citrix Metaframe
  * 应用平台: LAMP，LAM-J，J2EE，MX4J
  * 其他：网络设备交换机，路由器，网络服务等。

## 下载及安装 ##

  1. 从[Hyperic HQ 下载地址](http://sourceforge.net/projects/hyperic-hq/)中获得最新的开源版本。
  1. Server端安装
> Hyperic HQ的安装与其他管理软件在安装用户的权限要求上，有很大区别。一般管理软件都要求安装用户必须是root，但是Hyperic HQ却整好相反，他要求用户必须不能是root。

> 注意：如果想把检测数据记录到外部数据库上，譬如oracle，那么安装参数需要加 -oracle,即./setup.sh -oracle，并把数据库驱动（比如class12.jar或者oc4j.jar）放入安装包目录下的lib中。如果想在按照过程中显示所有选项，那么添加 -all。
```
[root@TServer hyperic-hq-installer]# ./setup.sh -oracle
提示不能使用root用户安装。
Execution of HQ setup not allowed as the root user.
Please log in as a different user and re-run 
/opt/hyperic/hyperic-hq-installer/installer-3.0.3/bin/hq-setup.sh
```
  1. su到普通用户安装
```
[root@TServer hyperic-hq-installer]# su - cl
因为Hyperic HQ是基于j2ee的，所以需要JAVA_HOME环境变量被正确设置。
[cl@TServer hyperic]$ set | grep JAVA
JAVA_HOME=/usr/java
```
  1. 执行安装脚本
```
[cl@TServer hyperic]$  /opt/hyperic/hyperic-hq-installer/installer-4.5.1/setup.sh -oracle
Initializing Hyperic HQ 4.5.1 Installation...
Loading taskdefs...
Taskdefs loaded
```
  1. 选择模块
> > 提示选择安装module，可以多选，以“,”分隔。此处我们只选择安装Server和Agent。
```
Choose which software to install:
1: Hyperic HQ Server
3: Hyperic HQ Agent
You may enter multiple choices, separated by commas.
1,3
```
  1. 选择路径
> > 选择安装路径，默认为/home/hyperic，此处我选择/opt/hyperic。
> > 注意，此目录对安装用户一定要有写(w)的权限；
```
HQ server installation path [default '/home/hyperic']:
  /opt/hyperic
```
  1. 指定smtp server
> > 选择smtp主机ip，此处使用本机为smtp server。
```
 Enter the fully qualified domain name of the SMTP server that HQ will 
 use to send  email messages [default '192.168.10.209']:
```
  1. 选择数据库
> > Hyperic 4.5.1目前支持Oracle 8/9i/10g和PostgreSQL。此处我选择2，Oracle9i/10g.
```
 Choices:
        1: Oracle 8
        2: Oracle 9i/10g
        3: PostgreSQL
What backend database should the HQ server use? [default '2']:
2
```
  1. 配置JDBC连接串
> > Url，此处按照自己的实际情况配置即可。
```
 Enter the JDBC connection URL for the Oracle 9i/10g database 
[default 'jdbc:oracle:thin:@localhost:1521:HYPERIC_HQ']:
jdbc:oracle:thin:@localhost:1521:fbdb
用户/密码，密码要输入两次：
Enter the username to use to connect to the database:
cl
Enter the password to use to connect to the database: 
(again): 
```
  1. 选择数据库数据安装方式
> > 因为我原来安装过Hyperic HQ的其他版本，所以选择2，删除现有数据。
```
Choices:
        1: Upgrade the HQ server database
        2: Overwrite the HQ server database (ERASE all existing data)
        3: Exit the installer
An HQ server database already exists at the JDBC connection URL.
What should be done with this database? [default '3']:
2
```
  1. 开始安装进程
```
Loading install configuration...
Install configuration loaded.
Preparing to install...
Validating server install configuration...
Checking server webapp port...
Checking server secure webapp port...
Checking server JRMP port...
Checking server JNP port...
Checking database permissions...
Verifying admin user properties
Validating server DB configuration...
Installing the server...
Unpacking server to: /opt/hyperic/server-3.0.3...
Creating server configuration files...
Copying binaries and libraries to server installation...
Copying server configuration file...
Copying server control file...
Copying server binaries...
Copying server libs...
Setting up server database...
Setting permissions on server binaries...
Fixing line endings on text files...
--------------------------------------------------------------------------------
Installation Complete:
  Server successfully installed to: /opt/hyperic/server-3.0.3
--------------------------------------------------------------------------------
```
  1. 安装成功
> > 提示启动server的脚本名称及用法，以及登录的url地址等。
> > 要记住用户、密码为：hqadmin/hqadmin。
> > 以及更改用户密码的方法。
```
You can now start your HQ server by running this command:

  /opt/hyperic/server-3.0.3/bin/hq-server.sh start

Note that the first time the HQ server starts up it may take several minutes
to initialize.  Subsequent startups will be much faster.

Once the HQ server reports that it has successfully started, you can log in
to your HQ server at: 

  http://localhost:7080/
  username: hqadmin
  password: hqadmin

To change your password, log in to the HQ server, click the "Administration"
link, choose "List Users", then click on the "hqadmin" user.
```
  1. 安装日志
> > 如果安装错误，可以从中找找原因。
```
Setup completed.
A copy of the output shown above has been saved to:
  /opt/hyperic/hyperic-hq-installer/installer-3.0.3/hq-install.log
```
## 重要配置 ##
    * 存储数据到数据库，查看上面的“配置JDBC连接串”
    * 发送警告邮件通知管理员
      1. 打开server-4.5.1\conf\hq-server.conf文件，找到"Email Settings"一段，然后添加邮件的smtp配置，下面是以公司邮件作为例子。
```
# 
# Property: server.mail.host
# 
# The IP or hostname of the SMTP server that the HQ server will use for sending
# alerts and other HQ-related emails.  Most UNIX platforms have a local SMTP
# server, in which case localhost or 127.0.0.1 can be used here.
server.mail.host=mail.hand-china.com
# Change to SMTP port
mail.smtp.port=25
# SMTP properties   
mail.smtp.auth=true
mail.user=真实账号
mail.password=真实密码
mail.smtp.socketFactory.class=javax.net.SocketFactory
mail.smtp.socketFactory.fallback=false
mail.smtp.socketFactory.port=25
mail.smtp.starttls.enable=false
```
> > > > 具体参考[Hyperic mail config](http://support.hyperic.com/display/EVO/Configuring+Hyperic+Server+for+SMTP+Server)
      1. 在http://localhost:7080/中配置alert警告条件，并在通知人中，添加需要通知的邮件列表。
  * 监控oracle数据库
    1. 把合适的数据库驱动放入server和agent目录中，譬如：server-4.5.1\lib和agent-4.5.1\bundles\agent-4.5.1\pdk\lib\jdbc中。
    1. 启动oracle数据库，此时hyperic会自动发现oracle，加入监控后，会提示配置不正确，此时需要配置jdbc的url连接、用户名和密码。配置正确的后，就会显示相关的oracle监控数据。
  * Aurora工程监控
    1. 打开tomcat安装目录的bin/catalina.bat，找到
```
  rem ----- Execute The Requested Command -----------------------------
```

> > > 在此后添加JAVA\_OPTS参数，windows下：
```
set JAVA_OPTS="%JAVA_OPTS% \
-Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.port=6969 \
-Dcom.sun.management.jmxremote.authenticate=false \
-Dcom.sun.management.jmxremote.ssl=false"
```
> > > linux或者unix下：
```
set JAVA_OPTS="$JAVA_OPTS \
-Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.port=6969 \
-Dcom.sun.management.jmxremote.authenticate=false \
-Dcom.sun.management.jmxremote.ssl=false"
```
> > > 6969就是jmx的端口号。注意：以上代码，如果想需要换行，就在行尾加"\",或者去掉"\"，把所有参数写在一行上。
    1. 在http://localhost:7080/中添加此tomcat对应的jvm安装路径，即手工添加一项server，类型选择 Sun JVM 1.5。
    1. 把uncertain-plugin.xml(从[附件下载](http://code.google.com/p/aurora-project/downloads/detail?name=hyperic-uncertain.zip&can=2&q=)从获取)放入server的server-4.5.1\hq-engine\hq-server\webapps\ROOT\WEB-INF\hq-plugins目录和agent的\agent-4.5.1\bundles\agent-4.5.1\pdk\plugins目录
    1. 把c3p0-jmx.jar放入server的server-4.5.1\hq-engine\hq-server\webapps\ROOT\WEB-INF\lib目录和agent的agent-4.5.1\bundles\agent-4.5.1\pdk\lib中
    1. 在 Sun JVM 1.5这个server下手工添加C3P0这个service类型。
  * 自定义查看Aurora jmx的各项属性值
    1. 通过jconsole查看并获得需要查看的ObjectName以及其属性，并修改uncertain-plugin.xml
    1. 在http://localhost:7080/中找到此属性值，并为其添加监控间隔时间值。
    1. 重启server和agent

