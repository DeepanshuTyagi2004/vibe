"use client";

import { useCurrentTheme } from '@/hooks/use-theme';
import { UserButton } from '@clerk/nextjs';
import React from 'react'
import {dark} from "@clerk/themes"

interface Props{
  showName?: boolean;
}

const UserControl = ({ showName }: Props) => {
  const theme = useCurrentTheme();
  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: "rounded-md!",
          userButtonAvatarBox: "rounded-md! size-8!",
          userButtonTrigger: "rounded-md!"
        },
        baseTheme: theme === "dark" ? dark : undefined
      }}
    />
  )
}

export default UserControl