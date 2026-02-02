import { redirect } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default function ProjectMineRedirect({ params }: Props) {
  const id = params?.id;
  if (!id) return null;
  redirect(`/dashboard/projects/mine/${id}`);
}
