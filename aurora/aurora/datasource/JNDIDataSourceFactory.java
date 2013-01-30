package aurora.datasource;

import java.sql.Connection;
import java.util.Properties;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import uncertain.exception.BuiltinExceptionFactory;

public class JNDIDataSourceFactory implements IDataSourceFactory {

	public static final String WEBLOGIC_CONTAINER_NAME = "WEBLOGIC";
	public static final String TOMCAT_CONTAINER_NAME = "TOMCAT";

	public static final String DEFAULT_CONTAINER_NAME = WEBLOGIC_CONTAINER_NAME;

	public static final int DEFAULT_LISTENERPORT = 7001;// weblogic

	@Override
	public DataSource createDataSource(DatabaseConnection dbConfig) throws Exception {

		String jndi_name = dbConfig.getJndiName();
		if (jndi_name == null)
			throw BuiltinExceptionFactory.createAttributeMissing(null, "jndiName");
		String containerName = dbConfig.getContainerName();
		if (containerName == null) {
			containerName = DEFAULT_CONTAINER_NAME;
		}
		if (TOMCAT_CONTAINER_NAME.equals(containerName)) {
			Context initCtx = new InitialContext();
			Context envCtx = (Context) initCtx.lookup("java:comp/env");
			// Look up our data source
			DataSource ds = (DataSource) envCtx.lookup(jndi_name);
			return ds;
		} else if (WEBLOGIC_CONTAINER_NAME.equals(containerName)) {
			return createDataSourceInWeblogic(jndi_name, dbConfig);
		}
		throw new IllegalArgumentException("The Web Sever Container:" + containerName + " is not support!");

	}

	private DataSource createDataSourceInWeblogic(String jndi_name, DatabaseConnection dbConfig) throws Exception {
		Properties pros = new Properties();
		int listenerPort = dbConfig.getListenerPort() > 0 ? dbConfig.getListenerPort() : DEFAULT_LISTENERPORT;
		String provider_url = "t3://127.0.0.1:" + listenerPort;
		pros.put(Context.PROVIDER_URL, provider_url);
		pros.put(Context.INITIAL_CONTEXT_FACTORY, "weblogic.jndi.WLInitialContextFactory");
		Context ctx = new InitialContext(pros);
		DataSource ds = (DataSource) ctx.lookup(jndi_name);
		return ds;

	}

	@Override
	public void cleanDataSource(DataSource ds) {
		// not support;
	}

	@Override
	public Connection getNativeJdbcExtractor(Connection conn) throws Exception {
		return conn;
	}

}
