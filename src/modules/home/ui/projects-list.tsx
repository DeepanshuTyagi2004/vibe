import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const ProjectsList = () => {
  const trpc = useTRPC();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());
  return (
    <div className='w-full bg-white dark:bg-sidebar p-8 border rounded-xl flex flex-col gap-y-6 sm:gap-y-4'>
      <h2 className='text-2xl font-bold'>
        Saved Vibes
      </h2>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        {
          projects?.length == 0 && (
            <div className='col-span-full text-center'>
              <p className='text-xl text-muted-foreground'>
                Your saved vibes will be shown here
              </p>
            </div>
          )
        }
        {projects?.map((project) => {
          return <Button
            key={project.id}
            variant="outline"
            className='font-normal h-auto justify-start w-full text-start p-4'
            asChild
          >
            <Link href={`/projects/${project.id}`}>
              <div className='flex items-center gap-4'>
                <Image
                  src="/logo.svg"
                  alt="Vibe"
                  height={32}
                  width={32}
                  className='object-contain'
                />
                <div className='flex flex-col'>
                  <h3 className='truncate font-medium'>
                    {project.name}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true
                    })}
                  </p>
                </div>
              </div>
            </Link>
          </Button>
        })}
      </div>
    </div>
  )
}

export default ProjectsList