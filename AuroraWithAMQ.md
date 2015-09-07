## Apache ActiveMQ简介 ##

[Apache ActiveMQ](http://activemq.apache.org/) 是Apache出品，最流行的、功能强劲的开源消息组件。ActiveMQ完全支持JMS1.1和J2EE 1.4规范。

### ActiveMQ特性列表： ###
  1. 多种语言和协议编写客户端。语言: Java, C, C++, C#, Ruby, Perl, Python, PHP。应用协议: OpenWire,Stomp REST,WS Notification,XMPP,AMQP
  1. 完全支持JMS1.1和J2EE 1.4规范 (持久化,XA消息,事务)
  1. 对Spring的支持,ActiveMQ可以很容易内嵌到使用Spring的系统里面去,而且也支持Spring2.0的特性
  1. 通过了常见J2EE服务器(如 Tomcat,Geronimo,JBoss 4,GlassFish,WebLogic)的测试,其中通过JCA 1.5 resource adaptors的配置,可以让ActiveMQ可以自动的部署到任何兼容J2EE 1.4 商业服务器上
  1. 支持多种传送协议:in-VM,TCP,SSL,NIO,UDP,JGroups,JXTA
  1. 支持通过JDBC和journal提供高速的消息持久化
  1. 从设计上保证了高性能的集群,客户端-服务器,点对点
  1. 支持Ajax
  1. 支持与Axis的整合
  1. 可以很容易得调用内嵌JMS provider,进行测试

#### ActiveMQ安装 ####
  * JDK1.6及以上请安装最新版本的[ActiveMQ](http://activemq.apache.org/download.html),JDK1.5请下载5.42版本(5.5以上版本只支持JDK1.6以上)[ActiveMQ5.43](http://www.apache.org/dyn/closer.cgi?path=%2Factivemq%2Fapache-activemq%2F5.4.3%2Fapache-activemq-5.4.3-bin.zip)下载，
  * 解压zip(或者bin.tar.gz )目录如下:

> +bin (windows下面的bat和unix/linux下面的sh)

> +conf (activeMQ配置目录,包含最基本的activeMQ配置文件）

> +data (默认是空的)

> +docs (index,replease版本里面没有文档,-.-b不知道为啥不带)

> +example (几个例子）

> +lib (activemMQ使用到的lib)

> -activemq-all-.jar(ActiveMQ的binary)

> -LICENSE.txt

> -NOTICE.txt

> -README.txt

> -user-guide.html
你可以使用bin\activemq.bat(activemq) 启动.
> 几个小提示:
  1. 这个仅仅是最基础的ActiveMQ的配置,很多地方都没有配置因此不要直接使用这个配置用于生产系统
  1. 有的时候由于端口被占用,导致ActiveMQ错误,ActiveMQ可能需要以下端口1099(JMX),61616(默认的TransportConnector)
  1. 如果没有物理网卡,或者MS的LoopBackAdpater Multicast会报一个错误
### 测试你的ActiveMQ ###
启动activeMQ后，再打开两个命令窗口，都进入activemq\example
  * 一个运行：ant consumer
  * 一个运行：ant producer
如果成功发送/接收了消息就OK了。

另外可以打开http://localhost:8161/admin，看看此页面能否正常访问。


---

## 在aurora中使用activemq ##
  1. 获得aurora-pulgin.jar、并从activemq/lib中复制activemq-core-.jar、geronimo-jms-1.1-spec-1.1.1.jar 放入%WEB\_HOME%/web-inf/lib中
  1. 放置oracle驱动（比如ojdbc14.jar或class12.jar）到activemq\lib目录下
  1. 在%WEB\_HOME%/web-inf/aurora.feature/下添加msg.config,内容参考如下
```
<?xml version="1.0" encoding="UTF-8"?>
<amq:AMQ-client-instance xmlns:msg="aurora.application.features.msg" 
xmlns:jms="aurora.plugin.jms" xmlns:amq="aurora.plugin.amq" 
url="failover:(tcp://192.168.11.111:61616)">
	    <messageHandlers>
	        <msg:DefaultMessageHandler name="refreshPriviledge" 
procedure="init.load_priviledge_check_data"/>
	        <msg:DefaultMessageHandler name="refreshService" 
procedure="init.load_system_service"/>
	    </messageHandlers>
		
	    <consumers>
	        <jms:consumer topic="application_foundation">
	            <events>
	                <msg:event handler="refreshPriviledge" 
message="priviledge_setting_change"/>
	                <msg:event handler="refreshService" message="service_config_change"/>
	            </events>
	        </jms:consumer>
			<jms:DefaultNoticeConsumer topic="dml_event"/>
	    </consumers>
</amq:AMQ-client-instance>
```
> > 说明 failover是amq内置的一种集群协议，它支持自动重连机制，即如果localhost机器意外中断，会自动重连到remotehost1。此处我们可以定义多台主机,请修改上面的IP地址为ActiveMQ实际安装的IP地址。
  1. 修改apache-activemq-\conf\activemq.xml文件，以配合实现客户端的重连机制
```
<!--
    Licensed to the Apache Software Foundation (ASF) under one or more
    contributor license agreements.  See the NOTICE file distributed with
    this work for additional information regarding copyright ownership.
    The ASF licenses this file to You under the Apache License, Version 2.0
    (the "License"); you may not use this file except in compliance with
    the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
-->
<!-- START SNIPPET: example -->
<beans
  xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
  http://activemq.apache.org/schema/core http://activemq.apache.org/schema/core/activemq-core.xsd">

    <!-- Allows us to use system properties as variables in this configuration file -->
    <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="locations">
            <value>file:${activemq.conf}/credentials.properties</value>
        </property>
    </bean>

    <!-- Allows log searching in hawtio console -->
    <bean id="logQuery" class="org.fusesource.insight.log.log4j.Log4jLogQuery"
          lazy-init="false" scope="singleton"
          init-method="start" destroy-method="stop">
    </bean>

    <!--
        The <broker> element is used to configure the ActiveMQ broker.
    -->
    <broker xmlns="http://activemq.apache.org/schema/core" brokerName="localhost" dataDirectory="${activemq.data}">

        <destinationPolicy>
            <policyMap>
              <policyEntries>
                <policyEntry topic=">" >
                    <!-- The constantPendingMessageLimitStrategy is used to prevent
                         slow topic consumers to block producers and affect other consumers
                         by limiting the number of messages that are retained
                         For more information, see:

                         http://activemq.apache.org/slow-consumer-handling.html

                    -->
                  <pendingMessageLimitStrategy>
                    <constantPendingMessageLimitStrategy limit="1000"/>
                  </pendingMessageLimitStrategy>
                </policyEntry>
              </policyEntries>
            </policyMap>
        </destinationPolicy>


        <!--
            The managementContext is used to configure how ActiveMQ is exposed in
            JMX. By default, ActiveMQ uses the MBean server that is started by
            the JVM. For more information, see:

            http://activemq.apache.org/jmx.html
        -->
        <managementContext>
            <managementContext createConnector="false"/>
        </managementContext>

        <!--
            Configure message persistence for the broker. The default persistence
            mechanism is the KahaDB store (identified by the kahaDB tag).
            For more information, see:

            http://activemq.apache.org/persistence.html
        -->
		<!--
        <persistenceAdapter>
            <kahaDB directory="${activemq.data}/kahadb"/>
        </persistenceAdapter>
		-->
		<persistenceAdapter>
			<jdbcPersistenceAdapter dataDirectory="${activemq.base}/data" dataSource="#oracle-ds"/>
		</persistenceAdapter>

          <!--
            The systemUsage controls the maximum amount of space the broker will
            use before disabling caching and/or slowing down producers. For more information, see:
            http://activemq.apache.org/producer-flow-control.html
          -->
          <systemUsage>
            <systemUsage>
                <memoryUsage>
                    <memoryUsage percentOfJvmHeap="70" />
                </memoryUsage>
                <storeUsage>
                    <storeUsage limit="100 gb"/>
                </storeUsage>
                <tempUsage>
                    <tempUsage limit="50 gb"/>
                </tempUsage>
            </systemUsage>
        </systemUsage>

        <!--
            The transport connectors expose ActiveMQ over a given protocol to
            clients and other brokers. For more information, see:

            http://activemq.apache.org/configuring-transports.html
        -->
        <transportConnectors>
            <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
            <transportConnector name="openwire" uri="tcp://0.0.0.0:61616?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
            <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
            <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
            <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
            <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
        </transportConnectors>

        <!-- destroy the spring context on shutdown to stop jetty -->
        <shutdownHooks>
            <bean xmlns="http://www.springframework.org/schema/beans" class="org.apache.activemq.hooks.SpringContextHook" />
        </shutdownHooks>

    </broker>

    <!--
        Enable web consoles, REST and Ajax APIs and demos
        The web consoles requires by default login, you can disable this in the jetty.xml file

        Take a look at ${ACTIVEMQ_HOME}/conf/jetty.xml for more details
    -->
    <import resource="jetty.xml"/>
       
    <bean id="oracle-ds" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
    <property name="driverClassName" value="oracle.jdbc.driver.OracleDriver"/>
    <property name="url" value="jdbc:oracle:thin:@localhost:1521:AMQDB"/>
    <property name="username" value="scott"/>
    <property name="password" value="tiger"/>
    <property name="maxActive" value="200"/>
    <property name="poolPreparedStatements" value="true"/>
  </bean>

</beans>
<!-- END SNIPPET: example -->
```
> > 在启动amq后，会在数据中自动创建三种表
      * ACTIVEMQ\_ACKS 接收应答表
      * ACTIVEMQ\_MSGS 发送信息表
      * ACTIVEMQ\_LOCK 主机锁表
> > amq服务器的重连机制如下：
> > 如客户端所配置的，我们有两台主机，一台是localhost，一台是remotehost1。两台机器的activemq.xml连接同一个数据库（即配置信息相同）。
> > 启动服务的时候，同时去数据库中抢夺资源锁，谁先抢到，谁就是主机，没抢到处于等待状态，等这台主机意外宕机后，再去抢锁，同样是谁先抢到，就谁是主机。
  1. 调用:在svc中输入
```
<msg:message-creator xmlns:msg="aurora.application.features.msg"
 message="lookup_update" topic="dml_event" trxType="true">
    <msg:properties>
      <msg:property key="code" value="${/parameter/record/@code}"/>
      <msg:property key="language" value="${/session/@lang}"/>
    </msg:properties>
</msg:message-creator>
```
  1. 启动
    1. 启动activeMQ
    1. 重启Web服务