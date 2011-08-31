package aurora.application.sourcecode;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import org.xml.sax.SAXParseException;

import uncertain.composite.CompositeLoader;
import uncertain.composite.CompositeMap;
import uncertain.exception.BuiltinExceptionFactory;
import uncertain.exception.ConfigurationFileException;
import uncertain.util.resource.ILocatable;

public class CustomSourceCode {

	public static final String KEY_RECORD_ID = "RECORD_ID";
	public static final String KEY_ID_VALUE = "ID_VALUE";
	public static final String KEY_MOD_TYPE = "MOD_TYPE";
	public static final String KEY_ARRAY_NAME = "ARRAY_NAME";
	public static final String KEY_INDEX_FIELD = "INDEX_FIELD";
	public static final String KEY_INDEX_VALUE = "INDEX_VALUE";
	public static final String KEY_ATTRIB_KEY = "ATTRIB_KEY";
	public static final String KEY_ATTRIB_VALUE = "ATTRIB_VALUE";
	public static final String KEY_CONFIG_CONTENT = "CONFIG_CONTENT";
	public static final String KEY_POSITION="POSITION";
	
	private static final String ILLEGAL_OPERATION_FOR_ROOT="aurora.application.sourcecode.illegal_operation_for_root";
	private static final String ILLEGAL_POSITION_FOR_OPERATION="aurora.application.sourcecode.illegal_position_for_operation";
	private static final String ILLEGAL_OPERATION="aurora.application.sourcecode.illegal_operation";
	public static CompositeMap custom(CompositeMap source, CompositeMap customConfig) {
		if (source == null || customConfig == null || customConfig.getChilds().size() == 0) {
			return source;
		}
		Map result = new LinkedHashMap();
		SourceCodeUtil.getKeyNodeMap(source, SourceCodeUtil.KEY_ID, result);
		if (result.isEmpty())
			return source;
		CompositeMap currentNode = null;
		String currentId = null;
		for (Iterator it = customConfig.getChildIterator(); it.hasNext();) {
			CompositeMap dbRecord = (CompositeMap) it.next();
			String record_id = dbRecord.getString(KEY_RECORD_ID);
			if (record_id == null)
				throw BuiltinExceptionFactory.createAttributeMissing(dbRecord.asLocatable(), KEY_RECORD_ID);
			String idValue = dbRecord.getString(KEY_ID_VALUE);
			if(idValue == null)
				throw SourceCodeUtil.createAttributeMissingException(KEY_RECORD_ID, record_id, SourceCodeUtil.KEY_ID, dbRecord.asLocatable());
			if (!idValue.equals(currentId)) {
				currentNode = (CompositeMap) result.get(idValue);
				if(currentNode == null)
					throw SourceCodeUtil.createNodeMissingException(SourceCodeUtil.KEY_ID,idValue,source.asLocatable());
				currentId = idValue;
			}
			String mode_type = dbRecord.getString(KEY_MOD_TYPE);
			if (mode_type == null)
				throw SourceCodeUtil.createAttributeMissingException(KEY_RECORD_ID, record_id, KEY_MOD_TYPE, dbRecord.asLocatable());
			String array_name = dbRecord.getString(KEY_ARRAY_NAME);
			CompositeMap objectNode = currentNode;
			if (array_name != null) {
				String index_field = dbRecord.getString(KEY_INDEX_FIELD);
				if (index_field == null)
					throw SourceCodeUtil.createAttributeMissingException(KEY_RECORD_ID, record_id, KEY_INDEX_FIELD, dbRecord.asLocatable());
				String index_value = dbRecord.getString(KEY_INDEX_VALUE);
				if (index_value == null)
					throw SourceCodeUtil.createAttributeMissingException(KEY_RECORD_ID, record_id, KEY_INDEX_VALUE, dbRecord.asLocatable());
				CompositeMap array = currentNode.getChild(array_name);
				if(array == null)
					throw BuiltinExceptionFactory.createNodeMissing(currentNode.asLocatable(), array_name);
				CompositeMap child = array.getChildByAttrib(index_field, index_value);
				if (child == null)
					throw SourceCodeUtil.createNodeMissingException(index_field,index_value,array.asLocatable());
				objectNode = child;
			}
			if ("set_attrib".equals(mode_type)) {
				String attrib_key = dbRecord.getString(KEY_ATTRIB_KEY);
				if (attrib_key == null)
					throw SourceCodeUtil.createAttributeMissingException(KEY_RECORD_ID, record_id, KEY_ATTRIB_KEY, dbRecord.asLocatable());
				String attrib_value = dbRecord.getString(KEY_ATTRIB_VALUE);
				objectNode.put(attrib_key, attrib_value);
			} else if ("replace".equals(mode_type)) {
				String config_content = dbRecord.getString(KEY_CONFIG_CONTENT);
				if (objectNode.getParent() == null) {
						throw createIllegalOperationForRootException(mode_type,objectNode.asLocatable());
				} else {
					if (config_content == null || "".equals(config_content))
						objectNode.getParent().removeChild(objectNode);
					CompositeLoader compositeLoader = new CompositeLoader();
					try {
						objectNode.getParent().replaceChild(objectNode, compositeLoader.loadFromString(config_content));
					}catch (Throwable e) {
						if(e instanceof SAXParseException){
							SAXParseException saxPe = (SAXParseException)e;
							throw new ConfigurationFileException("uncertain.exception.source_file",new String[]{"CONFIG_CONTENT",String.valueOf(saxPe.getLineNumber()),String.valueOf(saxPe.getColumnNumber())},null);
						}
						throw new ConfigurationFileException("uncertain.exception.code",new String[]{e.getMessage()},null);
					}
				}
			}else if("insert".equals(mode_type)){
				if (objectNode.getParent() == null) 
					throw createIllegalOperationForRootException(mode_type,objectNode.asLocatable());
				String key_position = dbRecord.getString(KEY_POSITION);
				if(key_position == null)
					throw SourceCodeUtil.createAttributeMissingException(KEY_RECORD_ID, record_id, KEY_POSITION, dbRecord.asLocatable());
				String config_content = dbRecord.getString(KEY_CONFIG_CONTENT);
				CompositeLoader compositeLoader = new CompositeLoader();
				CompositeMap newChild = null;
				try {
					newChild = compositeLoader.loadFromString(config_content);
				} catch (Throwable e) {
					if(e instanceof SAXParseException){
						SAXParseException saxPe = (SAXParseException)e;
						throw new ConfigurationFileException("uncertain.exception.source_file",new String[]{"CONFIG_CONTENT",String.valueOf(saxPe.getLineNumber()),String.valueOf(saxPe.getColumnNumber())},null);
					}
					throw new ConfigurationFileException("uncertain.exception.code",new String[]{e.getMessage()},null);
				}
				int index = objectNode.getParent().getChilds().indexOf(objectNode);
				if("before".equals(key_position)){
					objectNode.getParent().addChild(index, newChild);
				}else if("after".equals(key_position)){
					objectNode.getParent().addChild(index+1, newChild);
				}else if("first_child".equals(key_position)){
					objectNode.getParent().addChild(0, newChild);
				}else if("last_child".equals(key_position)){
					objectNode.getParent().addChild(newChild);
				}else{
					throw createIllegalPositionForOperation(key_position,mode_type,dbRecord.asLocatable());
				}
			}else if("delete".equals(mode_type)){
				if (objectNode.getParent() == null) 
					throw createIllegalOperationForRootException(mode_type,objectNode.asLocatable());
				objectNode.getParent().removeChild(objectNode);
			}else if("cdata_replace".equals(mode_type)){
				String config_content = dbRecord.getString(KEY_CONFIG_CONTENT);
				objectNode.setText(config_content);
			}else if("cdata_append".equals(mode_type)){
				String key_position = dbRecord.getString(KEY_POSITION);
				if(key_position == null)
					throw BuiltinExceptionFactory.createAttributeMissing(dbRecord.asLocatable(), KEY_POSITION);
				String cdata = objectNode.getText()!= null?objectNode.getText():"";
				String config_content = dbRecord.getString(KEY_CONFIG_CONTENT,"");
				if("before".equals(key_position)){
					objectNode.setText(config_content+cdata);
				}else if("after".equals(key_position)){
					objectNode.setText(cdata+config_content);
				}else{
					throw createIllegalPositionForOperation(key_position,mode_type,dbRecord.asLocatable());
				}
			}else{
				throw createIllegalOperation(mode_type,dbRecord.asLocatable());
			}
		}
		return source;
	}

	private static ConfigurationFileException createIllegalOperationForRootException(String modeType,ILocatable iLocatable){
		return new ConfigurationFileException(ILLEGAL_OPERATION_FOR_ROOT,new String[]{modeType},iLocatable);
	}
	private static ConfigurationFileException createIllegalPositionForOperation(String position,String operation,ILocatable iLocatable){
		return new ConfigurationFileException(ILLEGAL_POSITION_FOR_OPERATION,new String[]{position,operation},iLocatable);
	}
	private static ConfigurationFileException createIllegalOperation(String operation,ILocatable iLocatable){
		return new ConfigurationFileException(ILLEGAL_OPERATION,new String[]{operation},iLocatable);
	}
}
