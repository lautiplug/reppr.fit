import { DumbbellIcon, Pen } from "lucide-react"
import { Link } from "react-router-dom"

export const TodaysActivity = () => {
  return (
    <section>
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl font-bold text-black">Actividades de hoy</h1>
        <div className="flex items-center gap-1 text-md text-gray-500">
          <Link to={"/exercises"}>Editar</Link>
          <Pen strokeWidth={1.5} className="text-gray-500" width={15} height={15} />
        </div>
      </div>
      <section className="flex items-center justify-between">
        <div className="bg-orange-400 text-white rounded-2xl px-4 py-3 flex flex-col items-center gap-4 m-3">
          <div className="bg-orange-600 text-white rounded-xl px-4 py-3 flex items-center gap-4 m-3">
            <DumbbellIcon strokeWidth={1.5} width={30} height={30} />
          </div>
          <div>
            <p className="text-center text-2xl font-bold">1350</p>
            <p className="text-center text-sm text-gray-100">Calories.</p>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-2xl px-4 py-4 flex flex-col gap-4 mr-4">
          <h2 className="font-bold">Día de piernas</h2>
          <p className="text-gray-500">Sentadillas, curl de isquios, aductores, gemelos, sentadilla búlgara, extensión de cuádriceps. </p>
        </div>
      </section>
    </section>
  )
}
