**修改/etc/jetty.xml**
```
    <!-- =========================================================== -->
    <!-- Set handler Collection Structure                            --> 
    <!-- =========================================================== -->
    <Set name="handler">
      <New id="Handlers" class="org.eclipse.jetty.server.handler.HandlerCollection">
        <Set name="handlers">
         <Array type="org.eclipse.jetty.server.Handler">
           <Item>
             <New id="Contexts" class="org.eclipse.jetty.server.handler.ContextHandlerCollection">
               <Set name="handlers">
	         <Array type="org.eclipse.jetty.server.Handler">
		   <Item>
		     <New class="org.eclipse.jetty.webapp.WebAppContext">
			<Set name="contextPath">/first</Set>  
  			<Set name="resourceBase">../HEC/templates</Set>
		     </New>
		    </Item>
		    <Item>
		      <New class="org.eclipse.jetty.webapp.WebAppContext">
		       <Set name="contextPath">/second</Set>  
  		       <Set name="resourceBase">../HEC/web</Set>
		     </New>
		   </Item> 
	         </Array>
	       </Set>			 
	     </New>
           </Item>
           <Item>
             <New id="DefaultHandler" class="org.eclipse.jetty.server.handler.DefaultHandler"/>
           </Item>
         </Array>
        </Set>
      </New>
    </Set>
```