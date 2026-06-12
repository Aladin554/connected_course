import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="ConnectedEducation"
        description="ConnectedEducation"
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to your Dashboard!</h1>
          <p className="text-white/90 text-sm md:text-base">
            Manage your core admin data from one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 md:gap-6">
        <div className="col-span-12 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/80">
          New dashboard content will go here.
        </div>
      </div>
    </>
  );
}
