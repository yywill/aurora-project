package sqlj.core.database;

import java.sql.DatabaseMetaData;
import java.sql.SQLException;

public class DatabaseDescriptor implements IDatabaseDescriptor {

	private String name = "";
	private boolean isOracle, isMysql;

	public void init(DatabaseMetaData dmd) throws SQLException {
		name = dmd.getDatabaseProductName();
		isOracle = name.equalsIgnoreCase("oracle");
		isMysql = name.equalsIgnoreCase("mysql");
	}

	@Override
	public String name() {
		return name;
	}

	@Override
	public boolean isOracle() {
		return isOracle;
	}

	@Override
	public boolean isMysql() {
		return isMysql;
	}

}
