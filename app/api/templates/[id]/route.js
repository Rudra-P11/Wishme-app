import dbConnect from '@/lib/db';
import Template from '@/models/Template';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const template = await Template.findById(id).lean();
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json({ template });
  } catch (error) {
    console.error('GET /api/templates/[id] error:', error);
    return Response.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const template = await Template.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json({ template });
  } catch (error) {
    console.error('PUT /api/templates/[id] error:', error);
    return Response.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const template = await Template.findByIdAndDelete(id);
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    return Response.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('DELETE /api/templates/[id] error:', error);
    return Response.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
