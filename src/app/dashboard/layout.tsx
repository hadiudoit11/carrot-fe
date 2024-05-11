'use client'
import Image from "next/image";
import { Fragment, ReactNode, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Link from "next/link";

const navigation = [
  { name: 'Dashboard', href: 'home', icon: HomeIcon, current: true },
  { name: 'Organization', href: 'organization', icon: UsersIcon, current: false },
  { name: 'News', href: 'News', icon: FolderIcon, current: false },
  { name: 'Projects', href: 'projects', icon: CalendarIcon, current: false },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Supply Chain', href: '#', icon: ChartPieIcon, current: false },
]
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]
const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes: string[]) { 
  return classes.filter(Boolean).join(' ')
}


interface RootLayoutProps {
  children: ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    // const router = useRouter()
    return (
        <html lang="en" className='h-full'>
            <body className="h-full">
                <div>
                <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    >
                    <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-in-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in-out duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                <span className="sr-only text-black">Close sidebar</span>
                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                            </div>
                        </Transition.Child>
                        {/* Sidebar component, swap this element with another sidebar if you like */}
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-orange-600 px-6 pb-2">
                            <div className="flex h-16 shrink-0 items-center">
                            <Image
                                className="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=white"
                                alt="Your Company"
                                width={120}
                                height={120}
                                />
                            </div>
                            <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                        href={item.href}
                                        className={classNames(
                                            item.current
                                            ? 'bg-indigo-700 text-white'
                                            : 'text-indigo-200 hover:text-white hover:bg-orange-700',
                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                        )}
                                        >
                                        <item.icon
                                            className={classNames(
                                            item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                                            'h-6 w-6 shrink-0'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                        </Link>
                                    </li>
                                    ))}
                                </ul>
                                </li>
                                <li>
                                <div className="text-xs font-semibold leading-6 text-indigo-200">Your teams</div>
                                <ul role="list" className="-mx-2 mt-2 space-y-1">
                                    {teams.map((team) => (
                                    <li key={team.name}>
                                        <Link
                                        href={team.href}
                                        className={classNames(
                                            team.current
                                            ? 'bg-indigo-700 text-white'
                                            : 'text-indigo-200 hover:text-white hover:bg-orange-700',
                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                        )}
                                        >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-orange-400 bg-orange-500 text-[0.625rem] font-medium text-white">
                                            {team.initial}
                                        </span>
                                        <span className="truncate">{team.name}</span>
                                        </Link>
                                    </li>
                                    ))}
                                </ul>
                                </li>
                            </ul>
                            </nav>
                        </div>
                        </Dialog.Panel>
                    </Transition.Child>
                    </div>
                </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-orange-500 px-6">
                    <div className="flex h-16 shrink-0 items-center">
                    <Image
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=white"
                        alt="Your Company"
                        width={120}
                        height={120}
                    />
                    </div>
                    <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                            <li key={item.name}>
                                <a
                                href={item.href}
                                className={classNames(
                                    item.current
                                    ? 'bg-orange-700 text-white'
                                    : 'text-gray-100 hover:text-white hover:bg-orange-700',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                                >
                                <item.icon
                                    className={classNames(
                                    item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                                    'h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                                </a>
                            </li>
                            ))}
                        </ul>
                        </li>
                        <li>
                        <div className="text-xs font-semibold leading-6 text-indigo-100">Your teams</div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                            <li key={team.name}>
                                <a
                                href={team.href}
                                className={classNames(
                                    team.current
                                    ? 'bg-orange-700 text-white'
                                    : 'text-indigo-100 hover:text-white hover:bg-orange-700',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                                >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-orange-400 bg-orange-600 text-[0.625rem] font-medium text-white">
                                    {team.initial}
                                </span>
                                <span className="truncate">{team.name}</span>
                                </a>
                            </li>
                            ))}
                        </ul>
                        </li>
                        <li className="-mx-6 mt-auto">
                        <a>
                        <div className='flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700'>
                            <Image
                            className="h-8 w-8 rounded-full bg-indigo-700 "
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                            width={32}
                            height={32}
                            />
                            <span className="sr-only">Your profile</span>
                            <span aria-hidden="true">Tom Cook</span>
                        </div> 
                        </a>   
                        </li>
                    </ul>
                    </nav>
                </div>
                </div> 

                <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-orange-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
                <button type="button" className="-m-2.5 p-2.5 text-indigo-200 lg:hidden" onClick={() => setSidebarOpen(true)}>
                    <span className="sr-only text-black">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
                <a href="#">
                    <span className="sr-only">Your profile</span>
                    <Image
                    className="h-8 w-8 rounded-full bg-indigo-700"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                    width={32}
                    height={32}
                    />
                </a>
                </div>

                <main className="py-10 lg:pl-72 bg-white px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
            </body>
        </html>

    );
    }