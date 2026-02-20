import { Link } from "react-router-dom"
import { Dumbbell, History, House, UserIcon } from 'lucide-react'

export const NavigationBar = () => {

  const navigationItems = [
    { 
      name: 'Home',
      icon: <House className="w-6 h-6" strokeWidth={1.5}/>,
      linkTo: '/'
    },
    {
      name: 'Workouts',
      icon: <Dumbbell className="w-6 h-6" strokeWidth={1.5}/>,
      linkTo: '/exercises'
    },
    {
      name: 'History',
      icon: <History className="w-6 h-6" strokeWidth={1.5}/>,
      linkTo: '/session'
    },
    {
      name: 'Profile',
      icon: <UserIcon className="w-6 h-6" strokeWidth={1.5}/>,
      linkTo: '/profile'
    },
  ]

  return (
    <section>
      <div>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-full">
          <ul className="flex justify-around">
            {navigationItems.map((item) => (
              <li key={item.name} className="py-2">
                {item.linkTo && (
                  <Link to={item.linkTo} className="flex flex-col items-center text-gray-600 hover:text-gray-800">
                    {item.icon}
                    <span className="text-xs mt-1">{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>  
  )
}
