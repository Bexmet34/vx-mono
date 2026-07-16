import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { getUserTemplates, addUserTemplate, updateUserTemplate, deleteUserTemplate, isUserPremium } from '@veyronix/database';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const templates = await getUserTemplates(userId);
  const isPremium = await isUserPremium(userId);

  return NextResponse.json({ templates, isPremium });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const isPremium = await isUserPremium(userId);

  try {
    const { templateName, header, description, rolesText } = await req.json();

    if (!templateName || !header || !rolesText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const templates = await getUserTemplates(userId);
    
    // Check limits (Free: 1, Premium: Unlimited)
    if (!isPremium && templates.length >= 1) {
      return NextResponse.json({ error: 'You have reached the template limit for free users. Please upgrade to premium.' }, { status: 403 });
    }

    const newTemplate = await addUserTemplate(userId, templateName, header, description, rolesText);
    return NextResponse.json(newTemplate);

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { id, templateName, header, description, rolesText } = await req.json();

    if (!id || !templateName || !header || !rolesText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = await updateUserTemplate(id, userId, { templateName, header, description, rolesText });
    if (!success) {
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
  }

  try {
    const success = await deleteUserTemplate(id, userId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
