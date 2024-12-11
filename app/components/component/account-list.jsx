
"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Payout } from "./payout"
import { getBank } from "@/lib/APIs"
import { useSelector } from "react-redux"

export function AccountList() {
  const { token } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState({ key: "cardType", order: "asc" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [Banks, setBanks] = useState([]);
  const [AddAcWindow, setAddAcWindow] = useState(false);
  const [data, setData] = useState({});
  const [filteredBanks, setfilteredBanks] = useState([]);


  async function fetchBanks() {
    try {
      const response = await getBank(token);
      if (response.success) {
        setBanks(response.user);
        setfilteredBanks(response.user);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  }

  useEffect(() => {
    fetchBanks();
  }, [])
  return (
    (<div className="container mx-auto px-4 md:px-6 py-8">
      <div
        className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <div className="ml-auto w-full md:w-auto">
          <Input
            placeholder="Search payment cards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white dark:bg-gray-950" />
        </div>
        <Button onClick={() => setAddAcWindow(true)} size="lg">Add Bank Account</Button>
      </div>
      {
        AddAcWindow ?
          <Payout data={data} />
          :
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => setSort({ key: "bank_name", order: sort.order === "asc" ? "desc" : "asc" })}>
                      Bank Name
                      {sort.key === "bank_name" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => setSort({ key: "account_number", order: sort.order === "asc" ? "desc" : "asc" })}>
                      Last 4 Digits
                      {sort.key === "account_number" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => setSort({ key: "ifsc_code", order: sort.order === "asc" ? "desc" : "asc" })}>
                      IFSC
                      {sort.key === "ifsc_code" && (
                        <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>
                      )}
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer"
                      onClick={() => setSort({ key: "name", order: sort.order === "asc" ? "desc" : "asc" })}>
                      Holder Name
                      {sort.key === "name" && (
                        <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanks.map((bank) => {
                    console.log(bank);
                    return (
                      <TableRow onClick={() =>{ setData(bank); setAddAcWindow(true)}} key={bank.account_number} >
                        <TableCell>{bank.bank_name}</TableCell>
                        <TableCell>****{bank.account_number.slice(-4)}</TableCell>
                        <TableCell>{bank.ifsc_code}</TableCell>
                        <TableCell className="text-right">{bank.name}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => setPage(page > 1 ? page - 1 : page)} />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(Banks.length / pageSize) }, (_, i) => i + 1).map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === page}
                        onClick={() => setPage(pageNumber)}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => setPage(page < Math.ceil(Banks.length / pageSize) ? page + 1 : page)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
      }
    </div >)
  );
}
