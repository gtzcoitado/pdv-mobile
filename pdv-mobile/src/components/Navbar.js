import { Link, useLocation } from 'react-router-dom'
import { useState }            from 'react'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ClipboardDocumentIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const loc             = useLocation().pathname

  const items = [
    { to: '/',          label: 'PDV',          icon: HomeIcon              },
    { to: '/products',  label: 'Produtos',     icon: CubeIcon              },
    { to: '/groups',    label: 'Grupos',       icon: Squares2X2Icon        },
    { to: '/stock',     label: 'Estoque',      icon: ClipboardDocumentIcon },
    { to: '/employees', label: 'Funcionários', icon: UserIcon              },
    { to: '/reports',   label: 'Relatórios',   icon: ChartBarIcon          },
  ]

  return (
    <nav className="bg-brand-dark text-white shadow">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        {/* brand */}
        <div className="text-xl font-bold text-white">
          PDV NEW RIFT
        </div>
        {/* hamburger / close */}
        <button
          onClick={()=>setOpen(o=>!o)}
          className="p-2 focus:outline-none"
        >
          {open
            ? <XMarkIcon className="w-6 h-6" />
            : <Bars3Icon className="w-6 h-6" />
          }
        </button>
      </div>

      {/* sliding menu */}
      <div
        className={`
          overflow-hidden
          transition-[max-height]
          duration-300
          ${open ? 'max-h-96' : 'max-h-0'}
        `}
      >
        <ul className="flex flex-col space-y-1 px-4 pb-4">
          {items.map(i=> {
            const Active = loc === i.to
            return (
              <li key={i.to}>
                <Link
                  to={i.to}
                  className={`
                    flex items-center space-x-2 rounded-lg px-3 py-2
                    hover:bg-brand-blue/20
                    ${Active ? 'bg-brand-blue/40' : ''}
                  `}
                  onClick={()=>setOpen(false)}
                >
                  <i.icon className="w-5 h-5" />
                  <span>{i.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
