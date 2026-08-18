import { PersonTable } from '@/components/table/PersonalTable';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileUp, Plus, PlusIcon, Star, Target, UserRound } from 'lucide-react';
import React from 'react'

type Props = {}

const Leads = (props: Props) => {
  const leadCards = [
    {title:'Total Leads', value: 120, icon:<UserRound/>},
    {title:'New Leads', value: 30, icon:<Plus/>},
    {title:'Converted Leads', value: 15, icon:<CheckCircle/>},
    {title:'Qualified', value: 30, icon:<Star/>},
    {title:'Converted', value: 15, icon:<Target/>},
  ];

  return (
    <div className='flex gap-4 flex-col'>
      <div className='leads-title flex flex-row align-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Leads</h1>
          <p className='text-muted-foreground'>Manage and track your leads in one place.</p>
        </div>
        <div className='flex gap-3'>
          <Button>
            <PlusIcon/>
            Add Lead
          </Button>
          <Button>
            <FileUp/>
            Import Leads
          </Button>
        </div>
      </div>
      <div className='lead-cards-cont flex flex-row justify-evenly gap-5 w-full'>
        {leadCards.map((card, index)=>{
          return(
            <div className='lead-card flex flex-row justify-between w-full border-2 rounded-lg p-4' key={index}>
              <div className='flex flex-col justify-between'>
                <h4>{card.title}</h4>
                <p>{card.value}</p>
              </div>
              <div>
                {card.icon}
              </div>
            </div>
          )
        })}
      </div>
      <div>
       <PersonTable/>
      </div>
    </div>
  )
}

export default Leads;