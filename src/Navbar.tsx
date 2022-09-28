/* This example requires Tailwind CSS v2.0+ */
import * as React from 'react'
import { Disclosure} from '@headlessui/react'
import "../dist/output.css"
import { BeakerIcon, RectangleStackIcon, MagnifyingGlassIcon, PhotoIcon} from '@heroicons/react/24/solid'

interface INavbarProps {
  setStateOfParent: (arg: string) => void,
}

interface INavbarState {
  navigation: [
    { name: string, href: string, current: boolean },
    { name: string, href: string, current: boolean },
    { name: string, href: string, current: boolean },
  ]
}

class Navbar extends React.Component<INavbarProps, INavbarState>{
    constructor(props){
        super(props);
        this.state ={
          navigation: [
            { name: 'Workspace', href: '#', current: true },
            { name: 'Gallery', href: '#', current: false },
            { name: 'Examples', href: '#', current: false },
          ]
        }
        this.classNames = this.classNames.bind(this);
        this.updateParentWindow = this.updateParentWindow.bind(this);
    }
    classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }
    getIcon = (name: string) => {
      switch(name){
        case 'Workspace':
          return <BeakerIcon className="inline-block h-6 w-6 text-amber-500"> </BeakerIcon>
        case 'Gallery':
          return <PhotoIcon className="inline-block h-6 w-6 text-amber-500"> </PhotoIcon>
        case 'Examples':
          return <MagnifyingGlassIcon className="inline-block h-6 w-6 text-amber-500"> </MagnifyingGlassIcon>
      }
    }

    updateParentWindow(name: string){
      this.props.setStateOfParent(name);
      let newNav = [
            { name: 'Workspace', href: '#', current: false },
            { name: 'Gallery', href: '#', current: false },
            { name: 'Examples', href: '#', current: false },
      ];
      switch(name){
        case 'Workspace':
          newNav[0].current = true;
          break;
        case 'Gallery':
          newNav[1].current = true;
          break;
        case 'Examples':
          newNav[2].current = true;
          break;
      }

      this.setState({navigation: [newNav[0], newNav[1], newNav[2]]});
    }
    render(){
      return (
        <Disclosure as="nav" className="bg-stone-600">
          {({ open }) => (
            <>
                <div className="relative flex h-16 items-center justify-between">
                  <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        {this.state.navigation.map((item) => (
                      <div className="flex space-x-4">
                            <a
                              onClick={() => this.updateParentWindow(item.name)}
                              key={item.name}
                              href={item.href}
                              aria-current={item.current ? 'page' : undefined}
                              className={this.classNames(
                                item.current ? 'bg-stone-900 text-white' : 'text-stone-300 hover:bg-stone-700 hover:text-white',
                                'px-3 py-2 rounded-md text-sm font-medium'
                              )}
                            >
                              {this.getIcon(item.name)}
                             <p className='inline-block'> {item.name} </p>
                          </a>
                      </div>
                        ))}
                  </div>
                </div>

            </>
          )}
        </Disclosure>
    )

    }
}

export default Navbar