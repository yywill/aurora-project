package node.action;

import ide.AuroraPlugin;
import helpers.CompositeMapUtil;
import helpers.LocaleMessage;

import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.swt.widgets.Event;

import editor.core.IViewer;

import uncertain.composite.CompositeMap;
import uncertain.composite.QualifiedName;

public class AddElementAction extends ActionListener{
	
	protected IViewer viewer;
	protected CompositeMap currentNode;
	protected QualifiedName childQN;
	private String text = null;
	public AddElementAction(IViewer viewer, CompositeMap currentNode, QualifiedName childQN,int actionStyle) {
		this.viewer = viewer;
		this.currentNode = currentNode;
		this.childQN = childQN;
		setActionStyle(actionStyle);
	}
	public AddElementAction(IViewer viewer, CompositeMap currentNode, QualifiedName childQN,String text,int actionStyle) {
		this.viewer = viewer;
		this.currentNode = currentNode;
		this.childQN = childQN;
		this.text = text;
		setActionStyle(actionStyle);
	}
	public void run() {
		CompositeMapUtil.addElement(currentNode, childQN);
		if (viewer != null) {
			viewer.refresh(true);
		}
	}
	public void handleEvent(Event event) {
		run();
	}

	public ImageDescriptor getDefaultImageDescriptor() {
		return AuroraPlugin.getImageDescriptor(LocaleMessage.getString("element.icon"));
	}
	public String getDefaultText() {
		if(text == null){
			if(currentNode == null||childQN==null)
				return "";
			String prefix = CompositeMapUtil.getContextPrefix(currentNode, childQN);
			childQN.setPrefix(prefix);
			text = childQN.getFullName();
		}
		return text;
	}

}
