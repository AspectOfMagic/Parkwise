import { ActionProvider } from './components/ActionContext'; // Path to your context

import type { NextPage } from 'next'
import React from 'react';
import Dashboard from './dashboard/Dashboard'

const Page: NextPage = () => {
  return (
    <ActionProvider>
      <Dashboard />
    </ActionProvider>
  )
}

export default Page
