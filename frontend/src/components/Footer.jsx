import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32  bg-[#F6F9FC]">
      <div className="flex flex-col md:flex-row items-start justify-center gap-10 py-10 border-b border-gray-500/30">
        <div className="max-w-96">
        <img src={assets.logo} className="invert" alt="" />

          <p className="mt-6 text-sm text-gray-500">
           Discover the world's most extraordinary places to stay, from boutique hotels to luxury villas and private islands
          </p>

          <div className="flex items-center gap-2 mt-3">
            <img src={assets.instagramIcon} alt="" className="w-6" />
            <img src={assets.facebookIcon} alt="" className="w-6" />
            <img src={assets.twitterIcon} alt="" className="w-6" />
          </div>
        </div>

        <div className="w-1/2 flex flex-wrap md:flex-nowrap justify-between">
          <div>
            <h2 className="font-semibold font-playFair text-gray-900 mb-5">RESOURCES</h2>

            <ul className="text-sm text-gray-500 space-y-2 list-none">
              <li>
                <a href="#">Documentation</a>
              </li>

              <li>
                <a href="#">Tutorials</a>
              </li>

              <li>
                <a href="#">Blog</a>
              </li>

              <li>
                <a href="#">Community</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold font-playFair text-gray-900 mb-5">COMPANY</h2>

            <div className="text-sm text-gray-500 space-y-2 list-none">
              <li>
                <a href="#">About</a>
              </li>

              <li>
                <a href="#">Careers</a>
              </li>

              <li>
                <a href="#">Privacy</a>
              </li>

              <li>
                <a href="#">Terms</a>
              </li>
            </div>
          </div>
        </div>
      </div>

      <p className="py-4 text-center text-xs md:text-sm text-gray-500">
        Copyright 2025 © StayHub. All
        Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
