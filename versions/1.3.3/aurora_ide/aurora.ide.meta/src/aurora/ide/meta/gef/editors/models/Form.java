package aurora.ide.meta.gef.editors.models;

public class Form extends BOX {
	/**
	 * 
	 */
	private static final long serialVersionUID = 3990396088428828805L;

	public Form() {
		setTitle("Form");
//		this.getDataset().setUseParentBM(false);
		this.setType("form");
		this.setSectionType(BOX.SECTION_TYPE_QUERY);
	}

	public int getHeadHight() {
		return 20;
	}
}