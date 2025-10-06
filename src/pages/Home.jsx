import React from "react";
import Header from "../components/Header";
import Categories from "../components/Categories";
import Filter from "../components/Filter";
import Cities from "../components/Cities";
import Hotels from "./hotels/Hotels";

const Home = () => {
  return (
    <main className="min-h-screen">
      <Categories />
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5">
        {/* location */}
        <div className="">
          <Cities />
        </div>
      </section>

      <div>
        {/* <Hotels /> */}
        <Hotels />
      </div>
    </main>
  );
};

export default Home;
