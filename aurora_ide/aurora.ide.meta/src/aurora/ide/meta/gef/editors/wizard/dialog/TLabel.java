package aurora.ide.meta.gef.editors.wizard.dialog;

import org.eclipse.swt.SWT;
import org.eclipse.swt.events.MouseAdapter;
import org.eclipse.swt.events.MouseEvent;
import org.eclipse.swt.events.PaintEvent;
import org.eclipse.swt.events.PaintListener;
import org.eclipse.swt.events.SelectionListener;
import org.eclipse.swt.graphics.GC;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Canvas;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.TypedListener;

public class TLabel extends Composite {

	private Image image = null;
	private String text = null;

	private Canvas canvas;
	private Label label;

	public TLabel(Composite parent, int style) {
		super(parent, style);
		this.setLayout(new GridLayout());

		canvas = new Canvas(this, SWT.None);
		canvas.setLayoutData(new GridData(GridData.FILL_BOTH));
		canvas.setBackground(getShell().getDisplay().getSystemColor(SWT.COLOR_WHITE));
		canvas.addMouseListener(new MouseAdapter() {
			public void mouseDown(MouseEvent e) {
				notifyListeners(SWT.MouseDown, new Event());
			}
		});

		label = new Label(this, SWT.CENTER);
		label.setLayoutData(new GridData(GridData.FILL_HORIZONTAL));
		label.addMouseListener(new MouseAdapter() {
			public void mouseDown(MouseEvent e) {
				notifyListeners(SWT.MouseDown, new Event());
			}
		});

		addPaintListener(new PaintListener() {
			public void paintControl(PaintEvent e) {
				onPaint(e);
			}
		});

	}

	public void addSelectionListener(SelectionListener listener) {
		checkWidget();
		if (listener == null) {
			SWT.error(SWT.ERROR_NULL_ARGUMENT);
		}
		TypedListener typedListener = new TypedListener(listener);
		addListener(SWT.Selection, typedListener);
		addListener(SWT.DefaultSelection, typedListener);
	}

	protected void onPaint(PaintEvent e) {
		if (image != null) {
			canvas.addPaintListener(new PaintListener() {
				public void paintControl(PaintEvent e) {
					GC gc = e.gc;
					gc.drawImage(image, (e.width - image.getImageData().width) / 2, (e.height - image.getImageData().height) / 2);
				}
			});
		}
		if (text != null) {
			label.setText(text);
			label.setBackground(this.getBackground());
		} else {
			label.setText("");
		}
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Image getImage() {
		return image;
	}

	public void setImage(Image image) {
		this.image = image;
	}

}
