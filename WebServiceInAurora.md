## Web Service ##

[Web Service](http://zh.wikipedia.org/wiki/Web%E6%9C%8D%E5%8A%A1)是一种面向服务的架构的技术，通过标准的Web协议提供服务，目的是保证不同平台的应用服务可以互操作。在Aurora框架中可以方便的提供Web Service服务及调用由他人发布的Web Service。
## 在Aurora中发布Web Service ##
  1. 从[Aurora-framework](http://www.aurora-framework.org/release/)上下载最新的aurora.jar
  1. 添加web service监听器。
> > 打开[WEB-HOME]\WEB-INF\aurora.feature\service-listener.config。在
```
<participant-list category="service">
```
> > 节点下，添加
```
<participant class="aurora.service.ws.SOAPServiceInterpreter"/>
```
> > 子节点。
  1. 在web.xml下添加wsdl的servlet
```
   <!--第一段-->
   <servlet>
        <servlet-name>wsdl</servlet-name>
        <servlet-class>aurora.service.http.WSDLServlet</servlet-class>
    </servlet>

    <!--第二段-->
    <servlet-mapping>
	<servlet-name>wsdl</servlet-name>
	<url-pattern>/wsdl/*</url-pattern>
    </servlet-mapping>  
```
> > 以上步骤配置后。可以根据bm自动生成wsdl文件。例如：可以通过 http://localhost:8080/hec2dev/wsdl/db.sys_notify_pkg.update_notify/update 来查看db/sys\_notify\_pkg/update\_notify.bm这个bm自动生成的wsdl文件。
  1. 添加soap用户名和密码校验
> > 修改[[WEB-HOME]]\WEB-INF\aurora.feature\service-procedure.config文件为
```
<p:procedure-registry xmlns:t="aurora.application.action"
 xmlns:a="http://www.aurora-framework.org/application" xmlns:p="uncertain.proc"
 xmlns:ws="aurora.service.ws">
    <p:procedures>
        <p:procedure name="pre-service">
            <p:set field="@success" value="true"/>
            <t:session-copy/>
	    <p:echo/><!--调式的时候启用，正式部署时删除-->
	    <p:switch test="/request/@soapaction">
		<p:case Value="*">
		    <ws:WS-login-checker model="db.sys_ws_login_check_pkg.login_check" modelaction="execute"
field="/parameter/@return_value" value="N" message="没有权限登录"/>
		</p:case>
                <p:case>
                   <!--其他原有内容-->
		   <p:switch test="@is_autocrud_service">
```
> > base 64解码后的用户名和密码可以通过${/Authorization/@user}和${/Authorization/@password}拿到。
  1. 添加[[WEB-HOME]]\WEB-INF\aurora.feature\soap.config，这里可以定义默认返回值，例如
```
   <ws:SOAPConfiguration xmlns:ws="aurora.service.ws" model="sys.WS.sys_web_services_for_query">
	<soapResponse xmlns="http://www.aurora-framework.org/schema">         
		<status>N</status>         
		<message>${/error/@message}</message>
		<result>${/parameter/@result}</result>				
	</soapResponse>
</ws:SOAPConfiguration>
```
  1. 访问BM的WSDL
> > 支持所有bm自动生成wsdl。例如：
    * http://localhost:8080/hec2dev/wsdl/db.sys_notify_pkg.update_notify/update
    * http://localhost:8080/hec2dev/wsdl/sys.SYS1070.sys_tasks/query?multi=Y
  1. 访问SVC的WSDL
> > svc的wsdl需要预定定义。如图：
> > ![https://aurora-project.googlecode.com/svn/wiki/images/sys_ws_edit.png](https://aurora-project.googlecode.com/svn/wiki/images/sys_ws_edit.png)
> > 使用方法：
      1. 需要调用的svc地址，以及访问的svc地址。
      1. 定义输入格式
      1. 定义输出格式，或者先任意输入xml格式
      1. 点击按钮生成wsdl，并保存
      1. 根据wsdl，用soapui生成调用模版并调用，记录真实返回结果
      1. 再更新输出格式，生成最终的wsdl
> > 管理所有svc的wsdl。如图：
> > ![https://aurora-project.googlecode.com/svn/wiki/images/sys_all_ws.png](https://aurora-project.googlecode.com/svn/wiki/images/sys_all_ws.png)
    * 响应格式固定：默认是选中。如果输入是任意多行，返回格式也要求是任意多行，即把每行的处理结果返回到行上，再统一返回。而不是仅仅显示全局处理成功或失败。那么这时候请取消“响应格式固定”，因为它可能是返回任意多行。其他情况下，仅需要返回成功或失败，或者返回一些少数的几个参数，可以选择“响应格式固定”。在不选中的情况下，以svc实际返回的结果为准。
    * 注意：这个功能也支持bm wsdl的定义。目前bm的返回结果，默认是采取soap.config中定义的格式。如果需要自定义特殊格式，在这里定义。
    * 定义好后，可以此svc的wsdl可以在线访问了。例如：   [http://127.0.0.1:8080/hec2dev/wsdl/modules/sys/WS/sample/svc/sys\_provide\_webservice\_one\_record\_sample.svc ](.md)
> > 例子
      * 假设svc地址是：
```
http://127.0.0.1:8080/hec2dev/modules/sys/WS/sample/svc/sys_provide_webservice_multi_records_sample.svc
```
      * 输入格式是：
```
<parameter sequenceNo="1" xmlns="http://www.aurora-framework.org/schema">
    <records>
       <record record_id="11" record_code="multi1"/>
       <record record_id="22" record_code="multi2"/>
   </records>
</parameter>
```
      * 输出格式是：
```
<parameter responseDate="2013-7-22" sequenceNo="1" xmlns="http://www.aurora-framework.org/schema">
    <records>
         <record record_id="11" record_code="multi1" record_status="ok"  />
         <record record_id="22" record_code="multi2" record_status="ok" />
    </records>
</parameter>
```
> > > 即返回结果在每行上，而不是返回固定格式。
      * 界面输入如下：
> > > ![https://aurora-project.googlecode.com/svn/wiki/images/sys_ws_multi_edit.png](https://aurora-project.googlecode.com/svn/wiki/images/sys_ws_multi_edit.png)
> > > 点击保存，并且不选中“响应格式固定”。
      * 创建svc如下：
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 上午11:07:34  
    $Revision: 1.0  
    $Purpose: 
-->
<a:service xmlns:a="http://www.aurora-framework.org/application" xmlns:p="uncertain.proc" trace="true">
    <a:init-procedure>
        
        <batch-apply sourcepath="/parameter/records">
            <a:model-execute model="db.sys_webservice_util_pkg.insert_sys_webservice_sample"/>
        </batch-apply>
        
        <p:set-element namespace="http://www.aurora-framework.org/schema" target="/parameter"/>

        
        <!-- 获得当前的时间-->
        <a:model-query fetchAll="true" fethOneRecord="true" model="sys.WS.sample.sys_query_sysdate"/>
        <p:set field="/parameter/@responseDate" sourceField="/model/record/@sysdate"/>

    </a:init-procedure>
    <a:service-output output="/parameter"/>
</a:service>

```
      * 打开soapui，并添加wsdl
> > > http://127.0.0.1:8080/hec2dev/wsdl/modules/sys/WS/sample/svc/sys_provide_webservice_multi_records_sample.svc
> > > 填入参数如下：
> > > ![https://aurora-project.googlecode.com/svn/wiki/images/soapui_multi.png](https://aurora-project.googlecode.com/svn/wiki/images/soapui_multi.png)
> > > 点击运行，查看返回结果。
  1. 撰写bm/svc文件，提供给他人调用即可。
### 简单例子 ###
我们提供一个svc，此svc把请求的数据插入到一个数据库表中。
  1. create table SYS\_WEB\_SERVICE\_TEST ( RECORD\_ID NUMBER, RECORD\_CODE VARCHAR2(100)); 新建一个对应的结果表
  1. 建立一个此表的bm,sys.test.sys\_web\_service\_test：
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 上午10:58:40  
    $Revision: 1.0  
    $Purpose: 
-->
<bm:model xmlns:bm="http://www.aurora-framework.org/schema/bm" alias="t1" baseTable="SYS_WEB_SERVICE_TEST">
    <bm:fields>
        <bm:field name="record_id" databaseType="NUMBER" datatype="java.lang.Long" physicalName="RECORD_ID" 
                  prompt="SYS_WEB_SERVICE_TEST.RECORD_ID"/>
        <bm:field name="record_code"databaseType="VARCHAR2"datatype="java.lang.String" physicalName="RECORD_CODE"
                  prompt="SYS_WEB_SERVICE_TEST.RECORD_CODE"/>
    </bm:fields>
</bm:model>
```
  1. 新建modules/sys/test/sys\_web\_service\_one\_record\_test.svc文件，并输入以下内容
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 上午11:07:34  
    $Revision: 1.0  
    $Purpose: 
-->
<a:service xmlns:a="http://www.aurora-framework.org/application" xmlns:p="uncertain.proc" trace="true">
    <a:init-procedure>
        <a:model-insert model="sys.test.sys_web_service_test"/>
        <!--
       	构造 返回格式，跟错误返回格式保持一致
        <soapResponse xmlns="http://www.aurora-framework.org/schema" success="true">
            <message>OK</message>
            <success>Y</success>
        </soapResponse>
        -->
        <p:set field="/soapResponse/@success" value="Y"/>
        <p:set field="/soapResponse/@message" value="OK"/>
        <p:echo/>
        <p:method-invoke className="uncertain.composite.CompositeUtil" methodName="expand">
            <p:arguments>
                <p:argument path="/soapResponse" type="uncertain.composite.CompositeMap"/>
            </p:arguments>
        </p:method-invoke>
        <p:set-element namespace="http://www.aurora-framework.org/schema" target="/soapResponse"/>
    </a:init-procedure>
    <a:service-output output="/soapResponse"/>
</a:service>
```

> > 以上内容就完成了服务器的编写，下面提供客户端的调用代码示例
  1. 使用开源框架axis2为例
```
import java.util.ArrayList;
import java.util.List;
import javax.xml.namespace.QName;
import org.apache.axiom.om.OMAbstractFactory;
import org.apache.axiom.om.OMElement;
import org.apache.axiom.om.OMFactory;
import org.apache.axis2.AxisFault;
import org.apache.axis2.addressing.EndpointReference;
import org.apache.axis2.client.Options;
import org.apache.axis2.client.ServiceClient;
import org.apache.commons.httpclient.Header;

import com.sun.xml.internal.messaging.saaj.util.Base64;

public class OneRecordClient {

	public static void main(String[] args) throws AxisFault {
		ServiceClient client = new ServiceClient();
		Options options = new Options();
		options.setTo(new EndpointReference("http://127.0.0.1:8080/hec2dev/modules/sys/test/sys_web_service_one_record_test.svc"));// 修正为实际工程的URL
		addAuthorization("linjinxiao", "ok", options);
		client.setOptions(options);
		OMElement request = makeRequest();
		OMElement response = client.sendReceive(request);
		System.out.println("response:" + response.toString());
	}

	private static void addAuthorization(String userName, String password, Options options) {
		String encoded = new String(Base64.encode(new String(userName + ":" + password).getBytes()));
		List list = new ArrayList();
		// Create an instance of org.apache.commons.httpclient.Header
		Header header = new Header();
		header.setName("Authorization");
		header.setValue("Basic " + encoded);
		list.add(header);
		options.setProperty(org.apache.axis2.transport.http.HTTPConstants.HTTP_HEADERS, list);
	}

	private static OMElement makeRequest() {
		OMFactory factory = OMAbstractFactory.getOMFactory();
		OMElement request = factory.createOMElement(new QName("", "parameter"));
		request.addAttribute("record_id", "1", null);
		request.addAttribute("record_code", "axis2", null);
		return request;
	}
}
```
  1. 查看插入数据库记录是否成功和控制台的结果是否正确。
  1. 使用[soapUI](http://sourceforge.net/projects/soapui/files/soapui/)客户端
> > 需要的WSDL文件内容
```
<wsdl:definitions xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://www.aurora-framework.org/schema" targetNamespace="http://www.aurora-framework.org/schema" name="sys.test.sys_web_service_test">
    <wsdl:types>
        <xsd:schema
        	targetNamespace="http://www.aurora-framework.org/schema" elementFormDefault="qualified">
        	<xsd:element name="parameter">
        		<xsd:complexType>
        			<xsd:attribute type="xsd:long" name="record_id" />
        			<xsd:attribute type="xsd:string" name="record_code" />
        		</xsd:complexType>
        	</xsd:element>
        	<xsd:element name="soapResponse">
        		<xsd:complexType>
        			<xsd:sequence>
        				<xsd:element name="success" type="xsd:string">
        				</xsd:element>
        				<xsd:element name="message"
        					type="xsd:string">
        				</xsd:element>
        			</xsd:sequence>
        		</xsd:complexType>
        	</xsd:element>
        </xsd:schema>
    </wsdl:types>
    <wsdl:message name="insertRequestmessage">
        <wsdl:part element="tns:parameter" name="insertRequestpart"/>
    </wsdl:message>
    <wsdl:message name="insertResponsemessage">
    	<wsdl:part name="insertResponsepart" element="tns:soapResponse"></wsdl:part>
    </wsdl:message>
    <wsdl:portType name="sys.test.sys_web_service_test_portType">
        <wsdl:operation name="insert">
            <wsdl:input message="tns:insertRequestmessage"/>
            <wsdl:output message="tns:insertResponsemessage"></wsdl:output>
        </wsdl:operation>
    </wsdl:portType>
    <wsdl:binding type="tns:sys.test.sys_web_service_test_portType" name="sys.test.sys_web_service_test_binding">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <wsdl:operation name="insert">
            <soap:operation soapAction="insert"/>
            <wsdl:input>
                <soap:body use="literal"/>
            </wsdl:input>
        </wsdl:operation>
    </wsdl:binding>
    <wsdl:service name="sys.test.sys_web_service_test_service">
        <wsdl:port name="sys.test.sys_web_service_test_port" binding="tns:sys.test.sys_web_service_test_binding">
            <soap:address location="http://127.0.0.1:8080/hec2dev/modules/sys/test/sys_web_service_one_record_test.svc"/>
        </wsdl:port>
    </wsdl:service>
</wsdl:definitions>
```
  1. PL/SQL客户端调用

> 先添加公共的函数
```
  procedure call_web_service(p_url            in varchar2, --不是wsdl的链接，而是真实需要调用的地址
                             p_payload        in varchar2,
                             p_operation_name in varchar2,
                             p_user_name      in varchar2,
                             p_password       in varchar2,
                             po_response      out varchar2) is
    v_http_req      utl_http.req;
    v_http_resp     utl_http.resp;
    v_part_response varchar2(32767);
    v_full_payload  VARCHAR2(32767);
  begin
    v_http_req := utl_http.begin_request(p_url,
                                         'POST',
                                         utl_http.http_version_1_1);
  
    --utl_http.set_header(v_http_req, 'Content-Type', 'text/xml');
    utl_http.set_header(v_http_req,
                        'Content-Type',
                        'text/xml;charset=utf-8');
  
    utl_http.set_header(v_http_req, 'SOAPAction', p_operation_name);
    if (p_user_name is not null) then
      utl_http.set_authentication(v_http_req, p_user_name, p_password);
    end if;
    v_full_payload := '<?xml version="1.0" encoding="utf-8"?>' ||
                      ' <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">' ||
                      NEW_LINE || '   <soapenv:Body>' || NEW_LINE ||
                      '       ' || p_payload || NEW_LINE ||
                      '   </soapenv:Body>' || NEW_LINE ||
                      '</soapenv:Envelope>' || NEW_LINE;
    utl_http.set_header(v_http_req,
                        'Content-Length',
                        length(v_full_payload));
    dbms_output.put_line('full_payload:' || NEW_LINE || v_full_payload);
    utl_http.write_text(v_http_req, v_full_payload);
    v_http_resp := utl_http.get_response(v_http_req);
    po_response := po_response || v_http_resp.status_code;
    begin
      loop
        utl_http.read_text(v_http_resp, v_part_response);
        po_response := po_response || v_part_response;
      end loop;
    exception
      when utl_http.end_of_body then
        null;
    end;
    utl_http.end_response(v_http_resp);
  exception
    when others then
      po_response := 'err: ' || sqlerrm;
  end call_web_service;
```
> 然后再写例子
```
    function example_call_ws_one_record return varchar2 is
    v_content  varchar2(500);
    v_response varchar2(3000);
  begin
    v_content := '<insertRequesttype xmlns="http://www.aurora-framework.org/schema" record_id="1" record_code="plsql"/>';
    call_web_service(p_payload => v_content,
                     --换成实际的IP地址和端口
                     p_url            => 'http://10.213.208.54:8080/hec2dev/autocrud/sys.test.sys_web_service_test/insert',
                     p_operation_name => 'insert',
                     p_user_name      => 'linjinxiao',
                     p_password       => 'ok',
                     po_response      => v_response);
    dbms_output.put_line(v_response);
    return v_response;
  
  end example_call_ws_one_record;
```
> 其中v\_content的内容格式在有WSDL文件的前提下，用soapUI生成代码模版，然后用pl/sql拼接出类似的字符串格式即可。
### 复杂例子 ###
这个例子处理有头行结构的例子。譬如，调用方发送过来的请求是如下格式
```
  <requestHead sequenceNo="1"/>
  <requestBody>
    <records>
       <record record_id="11" record_code="multi1"/>
       <record record_id="22" record_code="multi2"/>
    </records>
  </requestBody>
```
返回的结构要求是如下格式
```
<responseHead xmlns="http://www.aurora-framework.org/schema" sequenceNo="1" />
<responseBody responseDate="2012-12-27">
    <records>
		<record record_id="11" record_code="multi1" record_status="ok"  />
		<record record_id="22" record_code="multi2" record_status="ok" />
    </records>
</responseBody>
```
  1. 我们创建一个pkg：
```
create or replace package SYS_WEB_SERVICE_TEST_PKG is

  -- Author  : LINJINXIAO
  -- Created : 2012/12/27 14:16:36
  -- Purpose : Web Service测试

  procedure insert_sys_web_service_test(p_record_id     number,
                                        p_record_code   varchar2,
                                        p_record_status out varchar2);

end SYS_WEB_SERVICE_TEST_PKG;
/
create or replace package body SYS_WEB_SERVICE_TEST_PKG is

  procedure insert_sys_web_service_test(p_record_id     number,
                                        p_record_code   varchar2,
                                        p_record_status out varchar2) is
  begin
    insert into sys_web_service_test
      (record_id, record_code)
    values
      (p_record_id, p_record_code);
    p_record_status := 'ok';
  end insert_sys_web_service_test;

end SYS_WEB_SERVICE_TEST_PKG;
/
```
  1. 在db.sys\_web\_service\_test\_pkg.insert\_sys\_web\_service\_test bm中调用此pkg：
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 下午2:19:28  
    $Revision: 1.0  
    $Purpose: 
-->
<bm:model xmlns:bm="http://www.aurora-framework.org/schema/bm">
    <bm:operations>
        <bm:operation name="execute">
            <bm:parameters>
                <bm:parameter name="record_id" dataType="java.lang.Long" input="true" output="false" />
                <bm:parameter name="record_code" dataType="java.lang.String" input="true" output="false" />
                <bm:parameter name="record_status" dataType="java.lang.String" input="false" output="true"/>
            </bm:parameters>
            <bm:update-sql><![CDATA[
                begin
                    SYS_WEB_SERVICE_TEST_PKG.INSERT_SYS_WEB_SERVICE_TEST
                    (
                        p_record_id=>${@record_id},
                        p_record_code=>${@record_code},
                        p_record_status=>${@record_status}
                    );
                end;]]></bm:update-sql>
        </bm:operation>
    </bm:operations>
</bm:model>
```
  1. 撰写modules/sys/test/sys\_web\_service\_multi\_records\_test.svc如下：
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 上午11:07:34  
    $Revision: 1.0  
    $Purpose: 
-->
<a:service xmlns:a="http://www.aurora-framework.org/application" xmlns:p="uncertain.proc" trace="true">
    <a:init-procedure>
        <!-- 对数据进行循环操作-->
        <batch-apply sourcepath="/parameter/requestBody/records">
            <a:model-execute model="db.sys_web_service_test_pkg.insert_sys_web_service_test"/>
        </batch-apply>
        <!--更改节点的名称和namespace-->
        <p:set-element name="responseHead" namespace="http://www.aurora-framework.org/schema" target="/parameter/requestHead"/>
        <p:set-element name="responseBody" namespace="http://www.aurora-framework.org/schema" target="/parameter/requestBody"/>
        <!-- 获得当前的时间-->
        <a:model-query fetchAll="true" fethOneRecord="true" model="sys.test.sys_query_sysdate"/>
        <p:echo />
        <p:set field="/parameter/responseBody/@responseDate" sourceField="/model/record/@sysdate" />
    </a:init-procedure>
    <a:service-output output="/parameter"/>
</a:service>
```
其中sys.test.sys\_query\_sysdate的bm内容是
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 下午2:26:31  
    $Revision: 1.0  
    $Purpose: 
-->
<bm:model xmlns:bm="http://www.aurora-framework.org/schema/bm">
    <bm:operations>
        <bm:operation name="query">
            <bm:query-sql><![CDATA[select sysdate from dual]]></bm:query-sql>
        </bm:operation>
    </bm:operations>
    <bm:fields>
        <bm:field name="sysdate" databaseType="DATE" datatype="java.util.Date" physicalName="SYSDATE"/>
    </bm:fields>
</bm:model>
```
  1. 撰写客户端调用代码，同样是利用开源框架axis2：
```
import java.util.ArrayList;
import java.util.List;
import javax.xml.namespace.QName;
import org.apache.axiom.om.OMAbstractFactory;
import org.apache.axiom.om.OMElement;
import org.apache.axiom.om.OMFactory;
import org.apache.axis2.AxisFault;
import org.apache.axis2.addressing.EndpointReference;
import org.apache.axis2.client.Options;
import org.apache.axis2.client.ServiceClient;
import org.apache.commons.httpclient.Header;

import com.sun.xml.internal.messaging.saaj.util.Base64;

public class MultiRecordsClient {
	public static void main(String[] args) throws AxisFault {
		ServiceClient client = new ServiceClient();
		Options options = new Options();
		options.setTo(new EndpointReference("http://localhost:8080/hec2dev/modules/sys/test/sys_web_service_multi_records_test.svc"));
		addAuthorization("linjinxiao", "ok", options);
		client.setOptions(options);
		OMElement request = makeRequest();
		OMElement response = client.sendReceive(request);
		System.out.println("response:" + response.toString());
	}

	private static void addAuthorization(String userName, String password, Options options) {
		String encoded = new String(Base64.encode(new String(userName + ":" + password).getBytes()));
		List list = new ArrayList();
		// Create an instance of org.apache.commons.httpclient.Header
		Header header = new Header();
		header.setName("Authorization");
		header.setValue("Basic " + encoded);
		list.add(header);
		options.setProperty(org.apache.axis2.transport.http.HTTPConstants.HTTP_HEADERS, list);
	}

	private static OMElement makeRequest() {
		OMFactory factory = OMAbstractFactory.getOMFactory();
		OMElement parameter = factory.createOMElement(new QName("http://www.aurora-framework.org/schema", "parameter"));
		OMElement requestHead = factory.createOMElement(new QName("requestHead"));
		OMElement requestBody = factory.createOMElement(new QName("requestBody"));
		OMElement records = factory.createOMElement(new QName("records"));
		OMElement record1 = factory.createOMElement(new QName("record"));
		record1.addAttribute("record_id", "11", null);
		record1.addAttribute("record_code", "multi1", null);
		records.addChild(record1);
		OMElement record2 = factory.createOMElement(new QName("record"));
		record2.addAttribute("record_id", "22", null);
		record2.addAttribute("record_code", "multi2", null);
		records.addChild(record2);
		requestBody.addChild(records);
		parameter.addChild(requestHead);
		parameter.addChild(requestBody);
		return parameter;
	}
}

```
  1. 执行此客户端，并查询数据库记录和返回结果是否正确。
  1. 使用soapUI作为客户端
> > 添加wsdl内容如：
```
<wsdl:definitions xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://www.aurora-framework.org/schema" targetNamespace="http://www.aurora-framework.org/schema" name="sys.test.sys_web_service_multi_records_test">
    <wsdl:types>
        <xsd:schema targetNamespace="http://www.aurora-framework.org/schema" elementFormDefault="qualified">
            <xsd:element name="insertRequesttype">
                <xsd:complexType>
                	<xsd:sequence>
                		<xsd:element name="requestHead" maxOccurs="1" minOccurs="0">
                			<xsd:complexType>
                				<xsd:attribute name="sequenceNo"
                					type="xsd:string">
                				</xsd:attribute>
                			</xsd:complexType>
                		</xsd:element>
                		<xsd:element name="requestBody" maxOccurs="1" minOccurs="1">
                			<xsd:complexType>
                				<xsd:sequence>
                					<xsd:element name="records" maxOccurs="1" minOccurs="1" type="tns:recordsComplexType">

                					</xsd:element>
                				</xsd:sequence>
                			</xsd:complexType>
                		</xsd:element>
                	</xsd:sequence>
                	

                </xsd:complexType>
            </xsd:element>
            <xsd:complexType name="RecordType">
            	<xsd:attribute name="record_id" type="xsd:string"></xsd:attribute>
            	<xsd:attribute name="record_code" type="xsd:string"></xsd:attribute>
            	<xsd:attribute name="record_status" type="xsd:string"></xsd:attribute>
            </xsd:complexType>
            <xsd:element name="insertResponsetype">
            	<xsd:complexType>
            		<xsd:sequence>
            			<xsd:element name="responseBody">
            				<xsd:complexType>
            					<xsd:sequence>
            						<xsd:element name="records"
            							type="tns:recordsComplexType">
            						</xsd:element>
            					</xsd:sequence>
            					<xsd:attribute name="responseDate"
            						type="xsd:string">
            					</xsd:attribute>
            				</xsd:complexType>
            			</xsd:element>
            		</xsd:sequence>
            	</xsd:complexType>
            </xsd:element>
            <xsd:complexType name="recordsComplexType">
            	<xsd:sequence>
            		<xsd:element minOccurs="1" maxOccurs="unbounded"
            			name="record" type="tns:RecordType">
            		</xsd:element>
            	</xsd:sequence>
            </xsd:complexType>
        </xsd:schema>
    </wsdl:types>
    <wsdl:message name="insertRequestmessage">
        <wsdl:part element="tns:insertRequesttype" name="insertRequestpart"/>
    </wsdl:message>
    <wsdl:message name="insertResponse">
    	<wsdl:part name="insertResponsepar" element="tns:insertResponsetype"></wsdl:part>
    </wsdl:message>
    <wsdl:portType name="sys.test.sys_web_service_test_portType">
        <wsdl:operation name="insert">
            <wsdl:input message="tns:insertRequestmessage"/>
            <wsdl:output message="tns:insertResponse"></wsdl:output>
        </wsdl:operation>
    </wsdl:portType>
    <wsdl:binding type="tns:sys.test.sys_web_service_test_portType" name="sys.test.sys_web_service_multi_records_test_binding">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <wsdl:operation name="insert">
            <soap:operation soapAction="insert"/>
            <wsdl:input>
                <soap:body use="literal"/>
            </wsdl:input>
        </wsdl:operation>
    </wsdl:binding>
    <wsdl:service name="sys.test.sys_web_service_test_service">
        <wsdl:port name="sys.test.sys_web_service_test_port" binding="tns:sys.test.sys_web_service_multi_records_test_binding">
            <soap:address location="http://127.0.0.1:8081/hec2dev/modules/sys/test/sys_web_service_multi_records_test.svc"/>
        </wsdl:port>
    </wsdl:service>
</wsdl:definitions>
```
  1. PL/SQL客户端调用
```
  function example_call_ws_multi_records return varchar2 is
    v_content  varchar2(500);
    v_response varchar2(3000);
  begin
    v_content := '<sch:insertRequesttype xmlns:sch="http://www.aurora-framework.org/schema">
         <requestHead sequenceNo="1"/>
         <requestBody>
            <records>
               <record record_id="11111" record_code="pl/sql" />
               <record record_id="22222" record_code="oracle" />
            </records>
         </requestBody>
      </sch:insertRequesttype>';
    call_web_service(p_payload => v_content,
                     --换成实际的IP地址和端口
                     p_url            => 'http://10.213.208.54:8081/hec2dev/modules/sys/test/sys_web_service_multi_records_test.svc',
                     p_operation_name => 'insert',
                     p_user_name      => 'linjinxiao',
                     p_password       => 'ok',
                     po_response      => v_response);
  
    dbms_output.put_line(v_response);
    return v_response;
  end example_call_ws_multi_records;
```
输出结果如下：
```
full_payload:
<?xml version="1.0" encoding="utf-8"?> <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
       <sch:insertRequesttype xmlns:sch="http://www.aurora-framework.org/schema">
         <requestHead sequenceNo="1"/>
         <requestBody>
            <records>
               <record record_id="11111" record_code="pl/sql" />
               <record record_id="22222" record_code="oracle" />
            </records>
         </requestBody>
      </sch:insertRequesttype>
   </soapenv:Body>
</soapenv:Envelope>

200<?xml version='1.0' encoding='UTF-8'?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <parameter __parameter_parsed__="true" success="true">
            <responseHead xmlns="http://www.aurora-framework.org/schema" sequenceNo="1"/>
            <responseBody xmlns="http://www.aurora-framework.org/schema" responseDate="2012-12-31">
                <records>
                    <record record_code="pl/sql" __parameter_parsed__="true" record_id="11111" record_status="ok"/>
                    <record record_code="oracle" __parameter_parsed__="true" record_id="22222" record_status="ok"/>
                </records>
            </responseBody>
        </parameter>
    </soapenv:Body>
</soapenv:Envelope>

```

## 调用Web Service ##
假设服务端要求提交的格式如下：
```
 <a:soapRequest xmlns:a="http://www.aurora-framework.org/schema">
	<a:param1>1</a:param1>
	<a:param2>code</a:param2>
 </a:soapRequest>
```
返回的格式如下：
```
<a:soapResponse xmlns:a="http://www.aurora-framework.org/schema">
	<a:records>
		<a:record>
			<a:record_id>1111</a:record_id>
			<a:record_code>axis2</a:record_code>
		</a:record>
		<a:record>
			<a:record_id >2222</a:record_id>
			<a:record_code>soapUI</a:record_code>
		</a:record>
	</a:records>
</a:soapResponse>
```
  1. 模拟第三方发布服务，以axis2为例
    1. 下载[axis2](http://axis.apache.org/axis2/java/core/download.cgi)
    1. 把[aurora\_call Web Service](https://aurora-project.googlecode.com/files/auroraCall.zip)部署到[[AXIS2\_HOME](AXIS2_HOME.md)]/repository/services下，然后启动服务axis2server.bat/axis2server.sh
    1. wsdl文件如下：
```
<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions name="simple" targetNamespace="http://www.aurora-framework.org/schema" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://www.aurora-framework.org/schema" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/">
  <wsdl:types>
    <xsd:schema targetNamespace="http://www.aurora-framework.org/schema" elementFormDefault="qualified">
      <xsd:element name="soapRequest">
        <xsd:complexType>
          <xsd:sequence>
          	<xsd:element name="param1" type="xsd:string"/>
          	<xsd:element name="param2" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="soapResponse">
      	<xsd:complexType>
      		<xsd:sequence>
      			<xsd:element name="records" maxOccurs="1" minOccurs="1">
      				<xsd:complexType>
      					<xsd:sequence>
      						<xsd:element name="record" maxOccurs="unbounded" minOccurs="1">
      							<xsd:complexType>

      								<xsd:sequence>
      									<xsd:element name="record_id"
      										type="xsd:string">
      									</xsd:element>
      									<xsd:element name="record_code"
      										type="xsd:string">
      									</xsd:element>
      								</xsd:sequence>
      							</xsd:complexType>
      						</xsd:element>
      					</xsd:sequence>
      				</xsd:complexType>
      			</xsd:element>
      		</xsd:sequence>
      	</xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>
  <wsdl:message name="soapRequest">
    <wsdl:part name="parameters" element="tns:soapRequest">
    </wsdl:part>
  </wsdl:message>
  <wsdl:message name="soapResponse">
    <wsdl:part name="parameters" element="tns:soapResponse">
    </wsdl:part>
  </wsdl:message>
  <wsdl:portType name="auroraCallportType">
    <wsdl:operation name="auroraCall">
      <wsdl:input message="tns:soapRequest">
    </wsdl:input>
      <wsdl:output message="tns:soapResponse">
    </wsdl:output>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="auroraCallbinding" type="tns:auroraCallportType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="auroraCall">
      <soap:operation soapAction="http://www.aurora-framework.org/schema/auroraCall"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="auroraCall">
    <wsdl:port name="auroraCallSOAP" binding="tns:auroraCallbinding">
      <soap:address location="http://localhost:8080/axis2/services/auroraCall"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>

```
  1. 编写客户端代码
    1. 编写svc文件
```
<?xml version="1.0" encoding="UTF-8"?>
<!--
    $Author: linjinxiao  
    $Date: 2012-12-27 上午11:07:34  
    $Revision: 1.0  
    $Purpose: 
-->
<a:service xmlns:a="http://www.aurora-framework.org/application" xmlns:as="aurora.service" xmlns:p="uncertain.proc" trace="true">
    <a:init-procedure>
        <!-- 构建符合的请求的格式-->
        <p:set field="/soapRequest/@param1" value="1"/>
        <p:set field="/soapRequest/@param2" value="code"/>
        <p:set-element namespace="http://www.aurora-framework.org/schema" target="/soapRequest"/>
        <p:method-invoke className="uncertain.composite.CompositeUtil" methodName="expand">
            <p:arguments>
                <p:argument path="/soapRequest" type="uncertain.composite.CompositeMap"/>
            </p:arguments>
        </p:method-invoke>
        <!-- 请求WebService-->
        <a:ws-invoker inputPath="/soapRequest" raiseExceptionOnError="false" returnPath="/soapResponse" url="http://localhost:8080/axis2/services/auroraCall"/>
        <!--把子节点中cdata的内容整合成父节点中的一个属性 -->
        <p:method-invoke className="uncertain.composite.CompositeUtil" methodName="collapse">
            <p:arguments>
                <p:argument path="/soapResponse" type="uncertain.composite.CompositeMap"/>
            </p:arguments>
        </p:method-invoke>
        <p:echo />
        <as:SetParameterParsed/>
        <!-- 对数据进行循环操作-->
        <batch-apply sourcepath="/soapResponse/records">
            <a:model-insert model="sys.test.sys_web_service_test"/>
        </batch-apply>
    </a:init-procedure>
    <a:service-output output="/parameter"/>
</a:service>
```
    1. 调用此svc，并查看日志和数据库记录是否正确。
### svc常用功能简介 ###
  * aurora中的上下文（即context）
> > Aurora上下文是xml格式，它不仅存储了当前会话（session）的用户ID、角色ID、公司ID等信息，还存储了页面之间传递的参数等各种信息。
```
<context BusinessModelOperation="execute" service_name="modules/psr/PSR1010/psr_report_output.svc" >
    <request 
url="/new_hec/modules/psr/PSR1010/psr_report_output.svc" 
referer="http://localhost:10080/new_hec/modules/psr/PSR1020/psr_report_query.screen" 
accept-encoding="gzip,deflate,sdch"/>
    <cookie JSESSIONID="
{maxage=-1, secure=false, name=JSESSIONID, path=null, domain=null, 
value=24D3B80D0D2EB73703C0E8967C880B77.tomcat1}"/>
    <parameter return_value="oracle.sql.CLOB@12462d5" __parameter_parsed__="true" 
report_header_id="61"/>
    <session company_id="1" session_id="5990" role_id="1" lang="ZHS" is_ipad="N" 
user_id="21"/>
    <access-check status_code="success"/>
    <model/>
</context>
```
> > 从这个上下文中，我们可以看到/session/@company\_id的值是1，/parameter/@report\_header\_id的值是61。
  * echo 输出消息
> > 例子：
```
   <p:echo xmlns:p="uncertain.proc"/><!--打印整个上下文（context）的内容-->
   <p:echo xmlns:p="uncertain.proc" message="***mark here***"/><!--打印***mark here***--  >
```
  * set 增加或者设置属性
> > 例子：
```
   <p:set field="@success" value="true" xmlns:p="uncertain.proc"/><!--设置/@success的属性为true-->
```
  * 最基本的四个功能:model-query,model-insert,model-update,model-delete
  * **把单条记录查询结果返回的属性直接更新到指定的节点上: fetchOneRecord="true"** 。例子：
```
<a:model-query fetchAll="true" fetchOneRecord="true" model="sys.systest" rootPath="/model/result1/cancat"/>
```

> 如果不加此属性，返回的结果是
```
<model>
  <result1>
    <concat>
      <record employee_cod="test"/>
    </concat>
  </result1>
</model> 
```
> 加了此属性后，返回结果就是：
```
<model>
  <result1>
    <concat employee_cod="test"/>
   </result1>
</model> 
```
> 注意：**此属性仅对返回单条记录有效** 。
  * **批量循环处理：batch-apply** 。例子：
```
<batch-apply sourcepath="/model/syncAccResponse/out">
   <a:model-insert model="fnd.account_test"/>	
</batch-apply>
```
> 表示对/model/syncAccResponse/out下面的所有子节点执行model-insert操作。
  * **更改查询返回的数据格式**。例子：
```
<a:model-query fetchAll="true" model="sys.systest" localName="s2" attribAsCdata="true" 
attribAsCdataList="employee_code" prefix="ns1" 
nameSpace="http://www.aurora.org/simple" rootPath="/model/result1/cancat"/>
</a:model-query>
```
> 如果不加`localName="s2"...nameSpace="http://www.aurora.org/simple" `那段，那么原本的返回结果可能是
```
<model>
  <result1>
    <concat>
      <record employee_cod="test"/>
    </concat>
  </result1>
</model>
```
> 经过处理后，就变成
```
<model>
  <result1>
    <concat>
      <ns1:s2 xmlns:ns1="http://www.aurora.org/simple">test</ns1:s2>
    </concat>
  </result1>
</model>
```
  * **属性变成子节点**，例子：
```
 <p:method-invoke className="uncertain.composite.CompositeUtil" methodName="expand">
      <p:arguments>
         <p:argument path="/model" type="uncertain.composite.CompositeMap"/>
      </p:arguments>
</p:method-invoke>
```
> 原先的数据格式可能是这样的：
```
<model>
        <record account_other_code="test1" account_id="1"/>
        <record account_other_code="test2" account_id="2"/>
</model>
```
> 处理后的格式就是这样的
```
    <model>
        <record>
            <account_other_code><![CDATA[test1]]></account_other_code>
            <account_id><![CDATA[1]]></account_id>
        </record>
        <record>
            <account_other_code><![CDATA[test2]]></account_other_code>
            <account_id><![CDATA[2]]></account_id>
        </record>
    </model>
```
  * **把cdata的内容变成父节点的一个属性** ，例子：
```
 <p:method-invoke className="uncertain.composite.CompositeUtil" methodName="collapse">
      <p:arguments>
         <p:argument path="/model/syncAccResponse/out" type="uncertain.composite.CompositeMap"/>
      </p:arguments>
</p:method-invoke>
```
> 原先的数据格式可能是这样的：
```
<model>
  <syncAccResponse>
    <out>
      <s1>yes</s1>
      <s2>test</s2>
    </out>
  </syncAccResponse1>
</model>
```
> 处理后的格式就是这样的
```
<model>
  <syncAccResponse>
    <out s1="yes" s2="test"/>
  </syncAccResponse1>
</model>
```
  * **复制元素属性**，例子
```
 <p:method-invoke className="uncertain.composite.CompositeUtil" methodName="copyAttributes" >
     <p:arguments>
	<p:argument path="/model/result4" type="java.util.Map"/>
	<p:argument path="/parameter" type="java.util.Map"/>
    </p:arguments>
</p:method-invoke>
```
> 原先的格式可能是这样的
```
<model>
  <result4 s1="yes" s2="test"/>
</model>
<parameter s3="aurora" />
```
> 执行后就变成这个效果
```
<model>
  <result4 s1="yes" s2="test"/>
</model>
<parameter s1="yes" s2="test" s3="aurora" />
```
  * **更改元素名称、namespace和前缀**：set-element。
> 例子
```
 <p:set-element target="/model/syncAccResponse/out" name="ok" prefix="right"
 namespace="http://aurora.org" childLevel="0"/>
```
> 原先的格式可能是这样的：
```
 <model>
  <syncAccResponse>
    <out>
      <s1>yes</s1>
      <s2>test</s2>
    </out>
  </syncAccResponse1>
</model>
```
> 执行后变成：
```
 <model>
  <syncAccResponse>
    <right:ok xmlns:right="http://aurora.org">
      <s1>yes</s1>
      <s2>test</s2>
    </right:ok>
  </syncAccResponse1>
</model>
```
> 其中childLevel表示子节点的层次，如果是0，代表本节点，如果是1，表示下一级子节点。假设把上面的childLevel改成1，然后结果会变成：
```
 <model>
  <syncAccResponse>
    <out>
      <right:ok xmlns:right="http://aurora.org" >yes</right:o>
      <right:ok xmlns:right="http://aurora.org">test</right:o>
    </out>
  </syncAccResponse1>
</model>
```
## 相关工具推荐 ##
  1. [soapUI](http://sourceforge.net/projects/soapui/files/soapui/)，可以根据wsdl自动生成需要的报文模板，填充内容后可以模拟客户端调用
  1. [tcpmon](http://ws.apache.org/commons/tcpmon/download.cgi)，可以监听和截获某个端口的所有数据，通过它可以查看http请求和返回的所有头和内容信息。