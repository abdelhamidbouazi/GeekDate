import { PublicUserProfile } from "@/components/profile/PublicUserProfile"

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PublicUserProfile profileId={id} />
}
