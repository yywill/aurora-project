package sqlj.core;

import sqlj.exception.ParserException;
import sqlj.parser.ParameterParser;
import sqlj.parser.ParsedSql;

public class SqljBlock {
	private String source;
	private int startIdx;
	private int bodyStartIdx;
	private int bodyEndIdx;
	private String sql;
	private ParsedSql psql;

	private int id = -1;

	public void setId(int id) {
		this.id = id;
	}

	public int getId() {
		return id;
	}

	public String getSql() {
		return sql;
	}

	public void setSql(String sql) {
		this.sql = sql;//.trim();
		psql = null;
	}

	public ParsedSql getParsedSql() throws ParserException {
		if (psql == null) {
			ParameterParser pparser = new ParameterParser(sql);
			psql = pparser.parse();
		}
		return psql;
	}

	/**
	 * the sql range in original source
	 * 
	 * @param source
	 *            the original source
	 * @param startIdx
	 *            index of '{' +1
	 * @param endIdx
	 *            index of '}'
	 */
	public void setSourceRange(String source, int startIdx, int endIdx) {
		this.source = source;
		this.bodyStartIdx = startIdx;
		this.setBodyEndIdx(endIdx);
		this.sql = source.substring(startIdx, endIdx);
	}

	public int getBodyStartIdx() {
		return bodyStartIdx;
	}

	public void setBodyStartIdx(int startIdx) {
		this.bodyStartIdx = startIdx;
	}

	public int getBodyEndIdx() {
		return bodyEndIdx;
	}

	public void setBodyEndIdx(int endIdx) {
		this.bodyEndIdx = endIdx;
	}

	public int getStartIdx() {
		return startIdx;
	}

	public void setStartIdx(int startIdx) {
		this.startIdx = startIdx;
	}
}
