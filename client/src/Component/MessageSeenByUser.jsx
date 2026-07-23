import { useUser } from "@clerk/clerk-react"

export default function MessageSeenByUser({ seenBy, members }) {
  const { user } = useUser();

  const seenByMembers = members.filter(member => seenBy?.includes(member.id) && member.id !== user.id);
  const remainingMembers = members.filter(member => !seenBy?.includes(member.id) && member.id !== user.id)

  return (
    <div className='py-8 rounded-t-4xl bg-[var(--bg-surface)] backdrop-blur-xs space-y-4 border-t border-[var(--border-soft)] shadow-[var(--shadow-md)]'>
      <div className="seen-users">
        <p className='text-[var(--accent)] text-sm px-4 font-semibold'>Seen By Users ({seenByMembers.length}) </p>
        <div className="list flex flex-col justify-center items-center md:items-start gap-2 p-2 md:p-4">
          {seenByMembers.length > 0
            ? seenByMembers?.map(member => {
              return <div key={member.id} className="info flex gap-4 w-72">
                <div className="image ">
                  <img className="w-10  h-10 md:w-8 md:h-8 rounded-full" src={member.imageUrl} alt="" />
                </div>
                <div className="info flex flex-col justify-center">
                  <h3 className="text-sm md:text-xs capitalize">{member.firstName}</h3>
                  <p className="text-xs md:text-[10px]">{member.email}</p>
                </div>
              </div>
            })
            : <p className='text-sm text-center'> No user seen </p>
          }
        </div>
      </div>
      <div className="remaininguser">
        <p className='text-[var(--accent)] text-sm px-4 font-semibold'>Remaining users ({remainingMembers.length})</p>
        <div className="list flex flex-col justify-center items-center md:items-start gap-2 p-2 md:p-4">
          {remainingMembers.length > 0
            ? remainingMembers?.map(member => {
              return <div key={member.id} className="info flex gap-4 w-72">
                <div className="image ">
                  <img className="w-10 h-10 md:w-8 md:h-8 rounded-full" src={member.imageUrl} alt="" />
                </div>
                <div className="info flex flex-col justify-center">
                  <h3 className="text-sm md:text-xs capitalize">{member.firstName}</h3>
                  <p className="text-xs md:text-[10px]">{member.email}</p>
                </div>
              </div>
            })
            : <p className='text-sm text-center'> No user remaining </p>
          }
        </div>
      </div>
    </div>
  )
}
