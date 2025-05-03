'use client'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'

const stats = [
  { name: 'Net Sales', stat: '$71,897', previousStat: '$70,946', change: '12%', changeType: 'increase' },
  { name: 'Avg. Order', stat: '$58.16', previousStat: '$56.14', change: '2.02%', changeType: 'increase' },
  { name: 'Orders', stat: '2,457', previousStat: '2,862', change: '4.05%', changeType: 'decrease' },
]

function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Helper function to get different radial blur classes
function getRadialBlurClass(index: number): string {
  const positions = ['tl', 'tr', 'br', 'bl'];
  const colorTypes = ['primary', 'accent', 'secondary']; 
  
  const positionIndex = index % positions.length;
  const colorIndex = Math.floor(index / positions.length) % colorTypes.length;
  
  const position = positions[positionIndex];
  const colorType = colorTypes[colorIndex];
  
  return colorType === 'primary' 
    ? `radial-blur-${position}` 
    : `radial-blur-${position} radial-blur-${colorType}-${position}`;
}

export default function Snapshot() {
  return (
    <div className="w-full h-full">
      <h2 className="text-xl font-bold mb-4  text-text-primary">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item, index) => (
          <div 
            key={item.name} 
            className={`bg-bg-card rounded-lg border-2 border-border-accent p-4 shadow-accent-offset ${getRadialBlurClass(index)}`}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <dt className="text-xl font-extrabold text-text-secondary">{item.name}</dt>
                <div
                  className={classNames(
                    item.changeType === 'increase' ? 'bg-status-success bg-opacity-10 text-status-success' : 'bg-status-error bg-opacity-10 text-status-error',
                    'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium'
                  )}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowUpIcon
                      className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-status-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowDownIcon
                      className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-status-error"
                      aria-hidden="true"
                    />
                  )}
                  <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                  {item.change}
                </div>
              </div>
              
              <dd className="mt-4">
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-text-secondary">
                    {item.stat}
                  </div>
                  <span className="ml-2 text-sm font-medium text-text-secondary">from {item.previousStat}</span>
                </div>
              </dd>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
