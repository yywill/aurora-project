package aurora.ide.helpers;

import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;

import javax.sql.DataSource;

import org.eclipse.core.resources.IContainer;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceChangeEvent;
import org.eclipse.core.resources.IResourceChangeListener;
import org.eclipse.core.resources.IResourceDelta;
import org.eclipse.core.resources.IResourceDeltaVisitor;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jface.operation.IRunnableWithProgress;
import org.eclipse.swt.widgets.Display;

import uncertain.ocm.IObjectRegistry;
import aurora.ide.AuroraPlugin;
import aurora.ide.fake.uncertain.engine.FakeUncertainEngine;
import aurora.ide.project.AuroraProject;

public class DBConnectionUtil {

	final private static HashMap<IProject, FakeUncertainEngine> project_engine = new HashMap<IProject, FakeUncertainEngine>();

	static {

		AuroraPlugin.getWorkspace().addResourceChangeListener(
				new IResourceChangeListener() {
					public void resourceChanged(IResourceChangeEvent event) {
						IResourceDelta delta = event.getDelta();
						if (delta == null)
							return;
						try {
							delta.accept(new IResourceDeltaVisitor() {
								public boolean visit(IResourceDelta delta)
										throws CoreException {
									IResource resource = delta.getResource();
									if (resource instanceof IFile) {
										IFile file = (IFile) resource;
										if ("datasource.config".equals(file
												.getName())
												|| "0.datasource.config"
														.equals(file.getName())) {
											IProject project = file
													.getProject();
											FakeUncertainEngine fakeUncertainEngine = project_engine
													.get(project);
											if (fakeUncertainEngine != null) {
												fakeUncertainEngine.shutdown();
											}
										}
										return false;
									}
									return true;
								}
							});
						} catch (CoreException e) {
						}
					}
				});
	}

	private static FakeUncertainEngine createFakeUncertainEngine(
			IProject project) throws ApplicationException {
		AuroraProject ap = new AuroraProject(project);
		IContainer web_home = ap.getWeb_home();
		IFolder web_inf = ap.getWeb_inf();
		if (web_home == null || web_inf == null) {
			// do sth
			throw new ApplicationException("Aurora 工程设置不正确 ");
		}
		FakeUncertainEngine fue = new FakeUncertainEngine(web_home
				.getLocation().toOSString(), web_inf.getLocation().toOSString());
		return fue;
	}

	private class Runner implements IRunnableWithProgress {

		private Connection conn;
		private FakeUncertainEngine fue;

		public Runner(FakeUncertainEngine fue) {
			super();
			this.fue = fue;
		}

		public void run(IProgressMonitor monitor)
				throws InvocationTargetException, InterruptedException {
			monitor.beginTask("正在建立数据库连接", 130);
			monitor.worked(30);
			if (!fue.isRunning()) {
				monitor.setTaskName("启动Aurora引擎");
				fue.startup();
			}
			if (!fue.isSuccess()) {
				throw new InterruptedException();
			}

			monitor.setTaskName("获取数据库连接");
			monitor.worked(20);
			IObjectRegistry mObjectRegistry = fue.getObjectRegistry();
			DataSource ds = (DataSource) mObjectRegistry
					.getInstanceOfType(DataSource.class);
			monitor.worked(50);
			try {
				ds.setLoginTimeout(3);
				setConn(ds.getConnection());
			} catch (SQLException e) {
				throw new InvocationTargetException(e);
			} finally {
				monitor.done();
			}
		}

		public Connection getConn() {
			return conn;
		}

		public void setConn(Connection conn) {
			this.conn = conn;
		}

	}

	public static Connection getDBConnection(IProject project)
			throws ApplicationException {
		FakeUncertainEngine fue = getFakeUncertainEngine(project);
		final Runner runnable = new DBConnectionUtil().new Runner(fue);
		try {
			AuroraPlugin.getDefault().getWorkbench().getProgressService()
					.busyCursorWhile(runnable);
		} catch (InvocationTargetException e) {
			throw new ApplicationException("获取数据库连接失败!请查看"
					+ AuroraConstant.DbConfigFileName + "是否配置正确.", e);
		} catch (InterruptedException e) {
			throw new ApplicationException("获取数据库连接失败!请查看"
					+ AuroraConstant.DbConfigFileName + "是否配置正确.", e);
		}
		Connection conn = runnable.getConn();
		return conn;
	}

	public static Connection getDBConnectionSyncExec(IProject project)
			throws ApplicationException {
		FakeUncertainEngine fue = getFakeUncertainEngine(project);
		final Runner runnable = new DBConnectionUtil().new Runner(fue);
		Display.getDefault().syncExec(new Runnable() {

			public void run() {
				try {
					AuroraPlugin.getDefault().getWorkbench()
							.getProgressService().busyCursorWhile(runnable);
				} catch (InvocationTargetException e) {
					// throw new ApplicationException("获取数据库连接失败!请查看"
					// + AuroraConstant.DbConfigFileName + "是否配置正确.", e);
				} catch (InterruptedException e) {
					// throw new ApplicationException("获取数据库连接失败!请查看"
					// + AuroraConstant.DbConfigFileName + "是否配置正确.", e);
				}
			}

		});
		Connection conn = runnable.getConn();
		if (conn == null) {
			throw new ApplicationException("获取数据库连接失败!请查看"
					+ AuroraConstant.DbConfigFileName + "是否配置正确.");
		}
		return conn;
	}

	public static FakeUncertainEngine getFakeUncertainEngine(IProject project)
			throws ApplicationException {
		FakeUncertainEngine fue = project_engine.get(project);
		if (true || fue == null || fue.isRunning() == false) {
			fue = createFakeUncertainEngine(project);
			project_engine.put(project, fue);
		}
		return fue;
	}

	public static boolean testDBConnection(IProject project, String webHome)
			throws ApplicationException {
		return getDBConnection(project) != null;
		// if (webHome == null)
		// throw new ApplicationException("Web目录不能为空");
		// UncertainEngine ue =
		// UncertainEngineUtil.initUncertainProject(webHome);
		// if (ue == null)
		// throw new ApplicationException("获取UncertainProject失败!");
		// IObjectRegistry mObjectRegistry = ue.getObjectRegistry();
		// DataSource ds = (DataSource) mObjectRegistry
		// .getInstanceOfType(DataSource.class);
		// try {
		// Connection conn = ds.getConnection();
		// conn.close();
		// } catch (SQLException e) {
		// e.printStackTrace();
		// throw new ApplicationException("获取数据库连接失败!请查看"
		// + AuroraConstant.DbConfigFileName + "是否配置正确.", e);
		// }
		// return true;
	}

}